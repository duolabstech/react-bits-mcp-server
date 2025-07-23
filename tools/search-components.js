import { z } from 'zod';
import { searchComponents } from '../utils/file-reader.js';
import { validateAndSanitizeParams } from '../utils/validation.js';
import { logError, logInfo } from '../utils/logger.js';
/**
 * Schema for search_components tool parameters
 */
export const searchComponentsSchema = z.object({
    query: z.string().describe('Search query to find components'),
    category: z.enum(['Animations', 'Backgrounds', 'Components', 'TextAnimations']).optional().describe('Filter by category')
});
/**
 * Handle search_components tool requests
 * @param params - Tool parameters
 * @returns Promise with search results
 */
export async function handleSearchComponents(params) {
    try {
        // Validate and sanitize input parameters
        const validatedParams = validateAndSanitizeParams('search_components', params);
        const { query, category } = searchComponentsSchema.parse(validatedParams);
        logInfo(`Searching components with query: "${query}"${category ? ` in category: ${category}` : ''}`);
        // Search components in file system
        const results = await searchComponents(query, category);
        if (results.length === 0) {
            const message = category
                ? `No components found matching "${query}" in category '${category}'`
                : `No components found matching "${query}"`;
            return {
                content: [
                    {
                        type: 'text',
                        text: message
                    }
                ]
            };
        }
        // Group results by category
        const resultsByCategory = results.reduce((acc, component) => {
            if (!acc[component.category]) {
                acc[component.category] = [];
            }
            acc[component.category].push(component.name);
            return acc;
        }, {});
        // Format the output
        let output = `Search Results for "${query}":\n\n`;
        for (const [cat, componentNames] of Object.entries(resultsByCategory)) {
            output += `## ${cat}\n`;
            componentNames.sort().forEach(name => {
                output += `- ${name}\n`;
            });
            output += '\n';
        }
        output += `\nFound ${results.length} matching component${results.length === 1 ? '' : 's'}`;
        logInfo(`Search completed: found ${results.length} components matching "${query}"`);
        return {
            content: [
                {
                    type: 'text',
                    text: output
                }
            ]
        };
    }
    catch (error) {
        logError('Error in handleSearchComponents', error);
        // Return error information in a user-friendly format
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            content: [
                {
                    type: 'text',
                    text: `Error searching components: ${errorMessage}`
                }
            ]
        };
    }
}