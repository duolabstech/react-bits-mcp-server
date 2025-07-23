import { z } from 'zod';
import { getComponentMetadata } from '../utils/file-reader.js';
import { validateAndSanitizeParams } from '../utils/validation.js';
import { logError, logInfo } from '../utils/logger.js';
/**
 * Schema for get_component_metadata tool parameters
 */
export const getComponentMetadataSchema = z.object({
    componentName: z.string().describe('Name of the React Bits component (e.g., "AnimatedList", "GradientButton")')
});
/**
 * Handle get_component_metadata tool requests
 * @param params - Tool parameters
 * @returns Promise with component metadata
 */
export async function handleGetComponentMetadata(params) {
    try {
        // Validate and sanitize input parameters
        const validatedParams = validateAndSanitizeParams('get_component_metadata', params);
        const { componentName } = getComponentMetadataSchema.parse(validatedParams);
        logInfo(`Getting component metadata for: ${componentName}`);
        // Get component metadata from file system
        const metadata = await getComponentMetadata(componentName);
        if (!metadata) {
            throw new Error(`Metadata for component '${componentName}' not found`);
        }
        // Format metadata as readable text
        let output = `# ${metadata.name} Component Metadata\n\n`;
        output += `**Category:** ${metadata.category}\n\n`;
        if (metadata.description) {
            output += `**Description:** ${metadata.description}\n\n`;
        }
        if (metadata.dependencies && metadata.dependencies.length > 0) {
            output += `**Dependencies:**\n`;
            metadata.dependencies.forEach(dep => {
                output += `- ${dep}\n`;
            });
            output += '\n';
        }
        if (metadata.props && Object.keys(metadata.props).length > 0) {
            output += `**Props:**\n`;
            Object.entries(metadata.props).forEach(([propName, propInfo]) => {
                output += `- ${propName}: ${typeof propInfo === 'string' ? propInfo : JSON.stringify(propInfo)}\n`;
            });
            output += '\n';
        }
        if (metadata.examples && metadata.examples.length > 0) {
            output += `**Examples:**\n`;
            metadata.examples.forEach((example, index) => {
                output += `${index + 1}. ${example}\n`;
            });
            output += '\n';
        }
        logInfo(`Successfully retrieved component metadata for: ${componentName}`);
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
        logError('Error in handleGetComponentMetadata', error);
        // Return error information in a user-friendly format
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            content: [
                {
                    type: 'text',
                    text: `Error retrieving component metadata: ${errorMessage}`
                }
            ]
        };
    }
}