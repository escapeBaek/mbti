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
  description: z.string().describe('A brief description of the personality type.'),
});
export type AnalyzePersonalityOutput = z.infer<typeof AnalyzePersonalityOutputSchema>;

export async function analyzePersonality(input: AnalyzePersonalityInput): Promise<AnalyzePersonalityOutput> {
  return analyzePersonalityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePersonalityPrompt',
  input: {schema: AnalyzePersonalityInputSchema},
  output: {schema: AnalyzePersonalityOutputSchema},
  prompt: `Analyze the user's responses to a personality test and determine their personality type according to the 16Personalities model. Provide the four-letter personality type and a brief description in the specified language.

Responses: {{{responses}}}
Language: {{{language}}}

Respond in {{{language}}}. Return the personality type and a brief description.
`,
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
