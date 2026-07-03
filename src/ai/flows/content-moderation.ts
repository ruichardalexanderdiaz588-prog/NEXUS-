'use server';

/**
 * @fileOverview A content moderation AI agent.
 *
 * - moderateContent - A function that handles the content moderation process.
 * - ModerateContentInput - The input type for the moderateContent function.
 * - ModerateContentOutput - The return type for the moderateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateContentInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A media file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  contentType: z.enum(['photo', 'z-avatar']).describe('The type of content being moderated.'),
});
export type ModerateContentInput = z.infer<typeof ModerateContentInputSchema>;

const ModerateContentOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the content is safe and complies with the platform policies.'),
  reason: z.string().describe('The reason why the content was flagged as unsafe, if applicable.'),
});
export type ModerateContentOutput = z.infer<typeof ModerateContentOutputSchema>;

export async function moderateContent(input: ModerateContentInput): Promise<ModerateContentOutput> {
  return moderateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateContentPrompt',
  input: {schema: ModerateContentInputSchema},
  output: {schema: ModerateContentOutputSchema},
  prompt: `You are an AI content moderator for Nexus, a social media platform.

You are responsible for determining whether user-submitted content complies with the platform's policies.

Content Type: {{contentType}}

Analyze the following content and determine if it violates any of the following policies:

*   No nudity or sexually suggestive content
*   No violent, graphic, or disturbing content
*   No hate speech or discrimination
*   No illegal activities

Content: {{media url=mediaDataUri}}

Based on your analysis, set the isSafe output field to true if the content is safe and complies with all policies. If the content violates any policies, set isSafe to false and provide a detailed reason in the reason output field.

Ensure that the output is valid JSON.
`,
});

const moderateContentFlow = ai.defineFlow(
  {
    name: 'moderateContentFlow',
    inputSchema: ModerateContentInputSchema,
    outputSchema: ModerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
