'use server';

/**
 * @fileOverview Generates a summary of a user profile based on their bio, interests, and recent posts.
 *
 * - summarizeProfile - A function that generates the profile summary.
 * - SummarizeProfileInput - The input type for the summarizeProfile function.
 * - SummarizeProfileOutput - The return type for the summarizeProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeProfileInputSchema = z.object({
  bio: z.string().describe('The user bio.'),
  interests: z.string().describe('The user interests.'),
  recentPosts: z.string().describe('A summary of the user recent posts.'),
});

export type SummarizeProfileInput = z.infer<typeof SummarizeProfileInputSchema>;

const SummarizeProfileOutputSchema = z.object({
  summary: z.string().describe('A short summary of the user profile.'),
});

export type SummarizeProfileOutput = z.infer<typeof SummarizeProfileOutputSchema>;

export async function summarizeProfile(input: SummarizeProfileInput): Promise<SummarizeProfileOutput> {
  return summarizeProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProfilePrompt',
  input: {schema: SummarizeProfileInputSchema},
  output: {schema: SummarizeProfileOutputSchema},
  prompt: `You are an AI assistant helping to summarize user profiles on a social media app.

  Given the following information about a user, create a concise summary of their profile, highlighting their personality and interests.

  Bio: {{{bio}}}
  Interests: {{{interests}}}
  Recent Posts: {{{recentPosts}}}

  Summary:`,
});

const summarizeProfileFlow = ai.defineFlow(
  {
    name: 'summarizeProfileFlow',
    inputSchema: SummarizeProfileInputSchema,
    outputSchema: SummarizeProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
