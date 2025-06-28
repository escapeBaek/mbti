'use server';

/**
 * @fileOverview Analyzes user responses to determine their personality type based on the 16Personalities model.
 *
 * - analyzePersonality - A function that analyzes user responses and returns the personality type.
 * - AnalyzePersonalityInput - The input type for the analyzePersonality function.
 * - AnalyzePersonalityOutput - The return type for the analyzePersonality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePersonalityInputSchema = z.object({
  responses: z
    .array(z.number().int().min(1).max(7))
    .length(60)
    .describe(
      'An array of 60 integers representing the user\'s responses to the personality questions. Each number should be between 1 and 7 (inclusive).' // Corrected range
    ),
  language: z
    .enum(['ko', 'en', 'ja', 'zh', 'es'])
    .default('ko')
    .describe('The language in which the analysis should be returned.'),
});
export type AnalyzePersonalityInput = z.infer<typeof AnalyzePersonalityInputSchema>;

const AnalyzePersonalityOutputSchema = z.object({
  personalityType: z.string().describe('The four-letter personality type (e.g., INFJ).'),
  description: z.string().describe('A brief, one-paragraph description of the personality type.'),
  strengths: z.array(z.string()).describe('A list of 3-5 key strengths for this personality type.'),
  weaknesses: z.array(z.string()).describe('A list of 3-5 key weaknesses for this personality type.'),
  careerPaths: z.array(z.string()).describe('A list of 3-5 recommended career paths for this personality type.'),
  relationships: z.string().describe('A paragraph describing their approach to relationships.'),
});
export type AnalyzePersonalityOutput = z.infer<typeof AnalyzePersonalityOutputSchema>;

export async function analyzePersonality(input: AnalyzePersonalityInput): Promise<AnalyzePersonalityOutput> {
  return analyzePersonalityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePersonalityPrompt',
  input: {schema: AnalyzePersonalityInputSchema},
  output: {schema: AnalyzePersonalityOutputSchema},
  prompt: `Analyze the user's responses to a personality test and determine their personality type according to the 16Personalities model.

Based on the determined personality type, provide a detailed analysis in the specified language. This analysis should include:
1. The four-letter personality type (e.g., INFJ).
2. A brief, one-paragraph description of the personality type.
3. A list of 3-5 key strengths.
4. A list of 3-5 key weaknesses.
5. A list of 3-5 recommended career paths.
6. A paragraph describing their approach to relationships.

User's Responses (a series of numbers from 1-7): {{{responses}}}
Language for the output: {{{language}}}

Respond entirely in the requested language.`,
});

const analyzePersonalityFlow = ai.defineFlow(
  {
    name: 'analyzePersonalityFlow',
    inputSchema: AnalyzePersonalityInputSchema,
    outputSchema: AnalyzePersonalityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
