import { z } from 'zod';
import { getAvailableComponents } from '../utils/file-reader.js';
import { validateAndSanitizeParams } from '../utils/validation.js';
import { logError, logInfo } from '../utils/logger.js';
/**
 * Schema for list_components tool parameters
 */
export const listComponentsSchema = z.object({
    category: z.enum(['Animations', 'Backgrounds', 'Components', 'TextAnimations']).optional().describe('Filter by category')
});
/**
 * Handle list_components tool requests
 * @param params - Tool parameters
 * @returns Promise with list of available components
 */
export async function handleListComponents(params) {
    try {
        // Validate and sanitize input parameters
        const validatedParams = validateAndSanitizeParams('list_components', params);
        const { category } = listComponentsSchema.parse(validatedParams);
        logInfo(`Listing components${category ? ` for category: ${category}` : ''}`);
        // Get available components from file system
        const components = await getAvailableComponents(category);
        if (components.length === 0) {
            const message = category
                ? `No components found in category '${category}'`
                : 'No components found';
            return {
                content: [
                    {
                        type: 'text',
                        text: message
                    }
                ]
            };
        }
        // Group components by category
        const componentsByCategory = components.reduce((acc, component) => {
            if (!acc[component.category]) {
                acc[component.category] = [];
            }
            acc[component.category].push(component.name);
            return acc;
        }, {});
        // Format the output
        let output = 'Available React Bits Components:\n\n';
        for (const [cat, componentNames] of Object.entries(componentsByCategory)) {
            output += `## ${cat}\n`;
            componentNames.sort().forEach(name => {
                output += `- ${name}\n`;
            });
            output += '\n';
        }
        output += `\nTotal: ${components.length} components`;
        logInfo(`Successfully listed ${components.length} components`);
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
        logError('Error in handleListComponents', error);
        // Return error information in a user-friendly format
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            content: [
                {
                    type: 'text',
                    text: `Error listing components: ${errorMessage}`
                }
            ]
        };
    }
}