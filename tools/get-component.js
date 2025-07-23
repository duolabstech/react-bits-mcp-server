import { z } from 'zod';
import { getComponentSource } from '../utils/file-reader.js';
import { validateAndSanitizeParams } from '../utils/validation.js';
import { logError, logInfo } from '../utils/logger.js';
/**
 * Schema for get_component tool parameters
 */
export const getComponentSchema = z.object({
    componentName: z.string().describe('Name of the React Bits component (e.g., "AnimatedList", "GradientButton")')
});
/**
 * Handle get_component tool requests
 * @param params - Tool parameters
 * @returns Promise with component source code
 */
export async function handleGetComponent(params) {
    try {
        // Validate and sanitize input parameters
        const validatedParams = validateAndSanitizeParams('get_component', params);
        const { componentName } = getComponentSchema.parse(validatedParams);
        logInfo(`Getting component source for: ${componentName}`);
        // Get component source code from file system
        const sourceCode = await getComponentSource(componentName);
        if (!sourceCode) {
            throw new Error(`Component '${componentName}' not found`);
        }
        logInfo(`Successfully retrieved component source for: ${componentName}`);
        return {
            content: [
                {
                    type: 'text',
                    text: sourceCode
                }
            ]
        };
    }
    catch (error) {
        logError('Error in handleGetComponent', error);
        // Return error information in a user-friendly format
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            content: [
                {
                    type: 'text',
                    text: `Error retrieving component: ${errorMessage}`
                }
            ]
        };
    }
}