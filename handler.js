import { z } from 'zod';
import { ListResourcesRequestSchema, ListResourceTemplatesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, CallToolRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { logInfo, logError } from './utils/logger.js';
import { circuitBreakers } from './utils/circuit-breaker.js';
import { resources, resourceHandlers, resourceTemplateHandlers } from './resources.js';
import { prompts, promptHandlers } from './prompts.js';
import { toolHandlers } from './tools/index.js';
// Validation schemas
const componentSchema = {
    componentName: z.string().min(1, 'Component name is required'),
    category: z.enum(['Animations', 'Backgrounds', 'Components', 'TextAnimations']).optional(),
};
const searchSchema = {
    query: z.string().min(1, 'Search query is required'),
    category: z.enum(['Animations', 'Backgrounds', 'Components', 'TextAnimations']).optional(),
};
/**
 * Generic request handler with error handling and validation
 * Following MCP SDK 1.16.0 best practices for error handling
 * @param operation - Name of the operation for logging
 * @param params - Request parameters
 * @param handler - The actual handler function
 * @returns Promise with the handler result
 */
const handleRequest = async (operation, params, handler) => {
    try {
        logInfo(`Handling ${operation} request`, { params });
        const result = await handler(params);
        logInfo(`${operation} completed successfully`);
        return result;
    }
    catch (error) {
        logError(`Error in ${operation}`, error);
        throw error;
    }
};
/**
 * Sets up all request handlers for the MCP server
 * Following MCP SDK 1.16.0 best practices for handler registration
 * @param server - The MCP server instance
 */
export const setupHandlers = (server) => {
    logInfo('Setting up request handlers...');
    // List available resources when clients request them
    server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
        return await handleRequest('list_resources', request.params, async () => ({ resources }));
    });
    // Resource Templates
    server.setRequestHandler(ListResourceTemplatesRequestSchema, async (request) => {
        return await handleRequest('list_resource_templates', request.params, async () => ({ resourceTemplates }));
    });
    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async (request) => {
        return await handleRequest('list_tools', request.params, async () => {
            // Return the tools that are registered with the server
            const registeredTools = [
                {
                    name: 'get_component',
                    description: 'Get the source code for a specific React Bits component',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            componentName: {
                                type: 'string',
                                description: 'Name of the React Bits component (e.g., "AnimatedList", "BlobCursor")',
                            },
                            category: {
                                type: 'string',
                                description: 'Category of the component (Animations, Backgrounds, Components, TextAnimations)',
                                enum: ['Animations', 'Backgrounds', 'Components', 'TextAnimations']
                            }
                        },
                        required: ['componentName'],
                    },
                },
                {
                    name: 'get_component_demo',
                    description: 'Get demo code illustrating how a React Bits component should be used',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            componentName: {
                                type: 'string',
                                description: 'Name of the React Bits component (e.g., "AnimatedList", "BlobCursor")',
                            },
                            category: {
                                type: 'string',
                                description: 'Category of the component (Animations, Backgrounds, Components, TextAnimations)',
                                enum: ['Animations', 'Backgrounds', 'Components', 'TextAnimations']
                            }
                        },
                        required: ['componentName'],
                    },
                },
                {
                    name: 'list_components',
                    description: 'Get all available React Bits components',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            category: {
                                type: 'string',
                                description: 'Filter by category (Animations, Backgrounds, Components, TextAnimations)',
                                enum: ['Animations', 'Backgrounds', 'Components', 'TextAnimations']
                            }
                        },
                    },
                },
                {
                    name: 'get_component_metadata',
                    description: 'Get metadata for a specific React Bits component',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            componentName: {
                                type: 'string',
                                description: 'Name of the React Bits component (e.g., "AnimatedList", "BlobCursor")',
                            },
                            category: {
                                type: 'string',
                                description: 'Category of the component (Animations, Backgrounds, Components, TextAnimations)',
                                enum: ['Animations', 'Backgrounds', 'Components', 'TextAnimations']
                            }
                        },
                        required: ['componentName'],
                    },
                },
                {
                    name: 'search_components',
                    description: 'Search for React Bits components by name or functionality',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Search query (e.g., "animation", "cursor", "text")',
                            },
                            category: {
                                type: 'string',
                                description: 'Filter by category (Animations, Backgrounds, Components, TextAnimations)',
                                enum: ['Animations', 'Backgrounds', 'Components', 'TextAnimations']
                            }
                        },
                        required: ['query'],
                    },
                },
            ];
            return { tools: registeredTools };
        });
    });
    // Return resource content when clients request it
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        return await handleRequest('read_resource', request.params, async (validatedParams) => {
            const { uri } = validatedParams;
            // Check if this is a static resource
            const resourceHandler = resourceHandlers[uri];
            if (resourceHandler) {
                const result = await Promise.resolve(resourceHandler());
                return result;
            }
            // Check if this is a generated resource from a template
            for (const [pattern, handler] of Object.entries(resourceTemplateHandlers)) {
                const regex = new RegExp(pattern.replace(/\{[^}]+\}/g, '(.+)'));
                if (regex.test(uri)) {
                    const result = await Promise.resolve(handler(uri));
                    return result;
                }
            }
            throw new Error(`Resource not found: ${uri}`);
        });
    });
    // List available prompts
    server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
        return await handleRequest('list_prompts', request.params, async () => ({ prompts: Object.values(prompts) }));
    });
    // Get specific prompt content with optional arguments
    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        return await handleRequest('get_prompt', request.params, async (validatedParams) => {
            const { name, arguments: args } = validatedParams;
            const promptHandler = promptHandlers[name];
            if (!promptHandler) {
                throw new Error(`Prompt not found: ${name}`);
            }
            return promptHandler(args);
        });
    });
    // Tool request Handler - executes the requested tool with provided parameters
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        return await handleRequest('call_tool', request.params, async (validatedParams) => {
            const { name, arguments: params } = validatedParams;
            if (!name || typeof name !== 'string') {
                throw new Error("Tool name is required");
            }
            const handler = toolHandlers[name];
            if (!handler) {
                throw new Error(`Tool not found: ${name}`);
            }
            // Execute handler with circuit breaker protection
            const result = await circuitBreakers.external.execute(() => Promise.resolve(handler(params || {})));
            return result;
        });
    });
    // Add global error handler
    server.onerror = (error) => {
        logError('MCP server error', error);
    };
    logInfo('Handlers setup complete');
};
/**
 * Get Zod schema for tool validation if available
 * Following MCP SDK 1.16.0 best practices for schema validation
 * @param toolName Name of the tool
 * @returns Zod schema or undefined
 */
function getToolSchema(toolName) {
    try {
        switch (toolName) {
            case 'get_component':
            case 'get_component_demo':
            case 'get_component_metadata':
                return z.object(componentSchema);
            case 'search_components':
                return z.object(searchSchema);
            case 'list_components':
                return z.object({ category: z.string().optional() });
            default:
                return undefined;
        }
    }
    catch (error) {
        logError('Schema error', error);
        return undefined;
    }
}