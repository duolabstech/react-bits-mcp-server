import { z } from 'zod';
import { handleGetComponent } from './get-component.js';
import { handleGetComponentDemo } from './get-component-demo.js';
import { handleListComponents } from './list-components.js';
import { handleGetComponentMetadata } from './get-component-metadata.js';
import { handleSearchComponents } from './search-components.js';
/**
 * Tool handlers mapping
 */
export const toolHandlers = {
    get_component: handleGetComponent,
    get_component_demo: handleGetComponentDemo,
    list_components: handleListComponents,
    get_component_metadata: handleGetComponentMetadata,
    search_components: handleSearchComponents
};
/**
 * Tool schemas for validation
 */
export const toolSchemas = {
    get_component: z.object({
        componentName: z.string().describe('Name of the React Bits component (e.g., "AnimatedList", "GradientButton")')
    }),
    get_component_demo: z.object({
        componentName: z.string().describe('Name of the React Bits component (e.g., "AnimatedList", "GradientButton")')
    }),
    list_components: z.object({
        category: z.enum(['Animations', 'Backgrounds', 'Components', 'TextAnimations']).optional().describe('Filter by category')
    }),
    get_component_metadata: z.object({
        componentName: z.string().describe('Name of the React Bits component (e.g., "AnimatedList", "GradientButton")')
    }),
    search_components: z.object({
        query: z.string().describe('Search query to find components'),
        category: z.enum(['Animations', 'Backgrounds', 'Components', 'TextAnimations']).optional().describe('Filter by category')
    })
};
/**
 * Tools configuration for MCP server
 */
export const tools = {
    get_component: {
        description: 'Get the source code for a specific React Bits component',
        inputSchema: {
            type: 'object',
            properties: {
                componentName: {
                    type: 'string',
                    description: 'Name of the React Bits component (e.g., "AnimatedList", "GradientButton")'
                }
            },
            required: ['componentName']
        }
    },
    get_component_demo: {
        description: 'Get demo code illustrating how a React Bits component should be used',
        inputSchema: {
            type: 'object',
            properties: {
                componentName: {
                    type: 'string',
                    description: 'Name of the React Bits component (e.g., "AnimatedList", "GradientButton")'
                }
            },
            required: ['componentName']
        }
    },
    list_components: {
        description: 'Get all available React Bits components, optionally filtered by category',
        inputSchema: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    enum: ['Animations', 'Backgrounds', 'Components', 'TextAnimations'],
                    description: 'Filter components by category'
                }
            }
        }
    },
    get_component_metadata: {
        description: 'Get metadata for a specific React Bits component including dependencies and props',
        inputSchema: {
            type: 'object',
            properties: {
                componentName: {
                    type: 'string',
                    description: 'Name of the React Bits component (e.g., "AnimatedList", "GradientButton")'
                }
            },
            required: ['componentName']
        }
    },
    search_components: {
        description: 'Search for React Bits components by name or description',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query to find components'
                },
                category: {
                    type: 'string',
                    enum: ['Animations', 'Backgrounds', 'Components', 'TextAnimations'],
                    description: 'Filter search results by category'
                }
            },
            required: ['query']
        }
    }
};