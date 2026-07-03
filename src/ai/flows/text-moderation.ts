'use server';

/**
 * @fileOverview A text moderation AI agent.
 *
 * - moderateText - A function that handles the text moderation process.
 * - ModerateTextInput - The input type for the moderateText function.
 * - ModerateTextOutput - The return type for the moderateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateTextInputSchema = z.object({
  text: z.string().describe('The text to be moderated.'),
});
export type ModerateTextInput = z.infer<typeof ModerateTextInputSchema>;

const ModerateTextOutputSchema = z.object({
  isSafe: z
    .boolean()
    .describe('Whether the text is safe and complies with the platform policies.'),
  reason: z
    .string()
    .optional()
    .describe(
      'The reason why the text was flagged as unsafe, if applicable.'
    ),
});
export type ModerateTextOutput = z.infer<typeof ModerateTextOutputSchema>;

export async function moderateText(
  input: ModerateTextInput
): Promise<ModerateTextOutput> {
  return moderateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateTextPrompt',
  input: {schema: ModerateTextInputSchema},
  output: {schema: ModerateTextOutputSchema},
  prompt: `You are an AI content moderator for Nexus, a social media platform.

You are responsible for determining whether user-submitted text contains harmful content.

Analyze the following text and determine if it violates any of the following policies by being related to or containing:

*   Hate speech or discrimination
*   Violent, graphic, or disturbing content
*   Illegal activities or substances
*   Severe harassment or bullying
*   Nudity or sexually explicit terms

Text: "{{text}}"

Based on your analysis, set the isSafe output field to true if the text is safe. If the text violates any policies, set isSafe to false and provide a brief, user-friendly reason in the reason output field (e.g., "This search term is not allowed.").

Ensure that the output is valid JSON.
`,
});

const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: ModerateTextInputSchema,
    outputSchema: ModerateTextOutputSchema,
  },
  async input => {
    // Empty or very short queries are always safe.
    if (input.text.trim().length < 2) {
      return { isSafe: true };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
