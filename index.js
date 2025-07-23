#!/usr/bin/env node
/**
 * React Bits MCP Server
 *
 * A Model Context Protocol server for React Bits components.
 * Provides AI assistants with access to component source code, demos, and metadata.
 *
 * Usage:
 *   npx react-bits-mcp-server
 *   npx react-bits-mcp-server --github-api-key YOUR_TOKEN
 *   npx react-bits-mcp-server -g YOUR_TOKEN
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupHandlers } from './handler.js';
import { logError, logInfo } from './utils/logger.js';
/**
 * Parse command line arguments
 */
async function parseArgs() {
    const args = process.argv.slice(2);
    // Help flag
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
React Bits MCP Server

Usage:
  npx react-bits-mcp-server [options]

Options:
  --github-api-key, -g <token>    GitHub Personal Access Token for API access
  --help, -h                      Show this help message
  --version, -v                   Show version information

Examples:
  npx react-bits-mcp-server
  npx react-bits-mcp-server --github-api-key ghp_your_token_here
  npx react-bits-mcp-server -g ghp_your_token_here

Environment Variables:
  GITHUB_PERSONAL_ACCESS_TOKEN    Alternative way to provide GitHub token
  LOG_LEVEL                       Log level (debug, info, warn, error) - default: info

For more information, visit: https://github.com/react-bits/react-bits
`);
        process.exit(0);
    }
    // Version flag
    if (args.includes('--version') || args.includes('-v')) {
        // Read version from package.json
        try {
            const fs = await import('fs');
            const path = await import('path');
            const { fileURLToPath } = await import('url');
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const packagePath = path.join(__dirname, '..', 'mcp-package.json');
            const packageContent = fs.readFileSync(packagePath, 'utf8');
            const packageJson = JSON.parse(packageContent);
            console.log(`react-bits-mcp-server v${packageJson.version}`);
        }
        catch (error) {
            console.log('react-bits-mcp-server v1.0.0');
        }
        process.exit(0);
    }
    // GitHub API key
    const githubApiKeyIndex = args.findIndex(arg => arg === '--github-api-key' || arg === '-g');
    let githubApiKey = null;
    if (githubApiKeyIndex !== -1 && args[githubApiKeyIndex + 1]) {
        githubApiKey = args[githubApiKeyIndex + 1];
    }
    else if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
        githubApiKey = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    }
    return { githubApiKey };
}
/**
 * Main function to start the MCP server
 */
async function main() {
    try {
        logInfo('Starting React Bits MCP Server...');
        const { githubApiKey } = await parseArgs();
        // Note: GitHub API key provided but not used in file-based React Bits MCP server
        if (githubApiKey) {
            logInfo('GitHub API key provided (not used for file-based operations)');
        }
        // Initialize the MCP server with metadata and capabilities
        // Following MCP SDK 1.16.0 best practices
        const server = new Server({
            name: "react-bits-mcp-server",
            version: "1.0.0",
        }, {
            capabilities: {
                resources: {
                    "get_components": {
                        description: "List of available React Bits components that can be used in the project",
                        uri: "resource:get_components",
                        contentType: "text/plain"
                    }
                },
                prompts: {
                    "component_usage": {
                        description: "Get usage examples for a specific component",
                        arguments: {
                            componentName: {
                                type: "string",
                                description: "Name of the component to get usage for"
                            }
                        }
                    },
                    "component_search": {
                        description: "Search for components by name or description",
                        arguments: {
                            query: {
                                type: "string",
                                description: "Search query"
                            }
                        }
                    },
                    "component_comparison": {
                        description: "Compare two components side by side",
                        arguments: {
                            component1: {
                                type: "string",
                                description: "First component name"
                            },
                            component2: {
                                type: "string",
                                description: "Second component name"
                            }
                        }
                    },
                    "component_recommendation": {
                        description: "Get component recommendations based on use case",
                        arguments: {
                            useCase: {
                                type: "string",
                                description: "Use case description"
                            }
                        }
                    },
                    "component_tutorial": {
                        description: "Get a step-by-step tutorial for using a component",
                        arguments: {
                            componentName: {
                                type: "string",
                                description: "Name of the component for tutorial"
                            }
                        }
                    }
                },
                tools: {
                    "get_component": {
                        description: "Get the source code for a specific React Bits component",
                        inputSchema: {
                            type: "object",
                            properties: {
                                componentName: {
                                    type: "string",
                                    description: "Name of the React Bits component (e.g., \"AnimatedList\", \"BlobCursor\")"
                                },
                                category: {
                                    type: "string",
                                    description: "Category of the component (Animations, Backgrounds, Components, TextAnimations)",
                                    enum: ["Animations", "Backgrounds", "Components", "TextAnimations"]
                                }
                            },
                            required: ["componentName"]
                        }
                    },
                    "get_component_demo": {
                        description: "Get demo code illustrating how a React Bits component should be used",
                        inputSchema: {
                            type: "object",
                            properties: {
                                componentName: {
                                    type: "string",
                                    description: "Name of the React Bits component (e.g., \"AnimatedList\", \"BlobCursor\")"
                                },
                                category: {
                                    type: "string",
                                    description: "Category of the component (Animations, Backgrounds, Components, TextAnimations)",
                                    enum: ["Animations", "Backgrounds", "Components", "TextAnimations"]
                                }
                            },
                            required: ["componentName"]
                        }
                    },
                    "list_components": {
                        description: "Get all available React Bits components",
                        inputSchema: {
                            type: "object",
                            properties: {
                                category: {
                                    type: "string",
                                    description: "Filter by category (Animations, Backgrounds, Components, TextAnimations)",
                                    enum: ["Animations", "Backgrounds", "Components", "TextAnimations"]
                                }
                            }
                        }
                    },
                    "get_component_metadata": {
                        description: "Get metadata for a specific React Bits component",
                        inputSchema: {
                            type: "object",
                            properties: {
                                componentName: {
                                    type: "string",
                                    description: "Name of the React Bits component (e.g., \"AnimatedList\", \"BlobCursor\")"
                                },
                                category: {
                                    type: "string",
                                    description: "Category of the component (Animations, Backgrounds, Components, TextAnimations)",
                                    enum: ["Animations", "Backgrounds", "Components", "TextAnimations"]
                                }
                            },
                            required: ["componentName"]
                        }
                    },
                    "search_components": {
                        description: "Search for React Bits components by name or functionality",
                        inputSchema: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "Search query (e.g., \"animation\", \"cursor\", \"text\")"
                                },
                                category: {
                                    type: "string",
                                    description: "Filter by category (Animations, Backgrounds, Components, TextAnimations)",
                                    enum: ["Animations", "Backgrounds", "Components", "TextAnimations"]
                                }
                            },
                            required: ["query"]
                        }
                    }
                }
            }
        });
        // Set up request handlers and register components (tools, resources, etc.)
        setupHandlers(server);
        // Start server using stdio transport
        const transport = new StdioServerTransport();
        logInfo('Transport initialized: stdio');
        await server.connect(transport);
        logInfo('Server started successfully');
    }
    catch (error) {
        logError('Failed to start server', error);
        process.exit(1);
    }
}
// Start the server
main().catch((error) => {
    logError('Unhandled startup error', error);
    process.exit(1);
});