import { z } from 'zod';
import { getComponentDemo } from '../utils/file-reader.js';
import { validateAndSanitizeParams } from '../utils/validation.js';
import { logError, logInfo } from '../utils/logger.js';
/**
 * Schema for get_component_demo tool parameters
 */
export const getComponentDemoSchema = z.object({
    componentName: z.string().describe('Name of the React Bits component (e.g., "AnimatedList", "GradientButton")')
});
/**
 * Handle get_component_demo tool requests
 * @param params - Tool parameters
 * @returns Promise with component demo code
 */
export async function handleGetComponentDemo(params) {
    try {
        // Validate and sanitize input parameters
        const validatedParams = validateAndSanitizeParams('get_component_demo', params);
        const { componentName } = getComponentDemoSchema.parse(validatedParams);
        logInfo(`Getting component demo for: ${componentName}`);
        // Get component demo code from file system
        const demoCode = await getComponentDemo(componentName);
        if (!demoCode) {
            throw new Error(`Demo for component '${componentName}' not found`);
        }
        logInfo(`Successfully retrieved component demo for: ${componentName}`);
        return {
            content: [
                {
                    type: 'text',
                    text: demoCode
                }
            ]
        };
    }
    catch (error) {
        logError('Error in handleGetComponentDemo', error);
        // Return error information in a user-friendly format
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            content: [
                {
                    type: 'text',
                    text: `Error retrieving component demo: ${errorMessage}`
                }
            ]
        };
    }
}