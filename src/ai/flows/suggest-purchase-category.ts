'use server';

/**
 * @fileOverview An AI agent that suggests a purchase category based on a description.
 *
 * - suggestPurchaseCategory - A function that handles the purchase category suggestion process.
 * - SuggestPurchaseCategoryInput - The input type for the suggestPurchaseCategory function.
 * - SuggestPurchaseCategoryOutput - The return type for the suggestPurchaseCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPurchaseCategoryInputSchema = z.object({
  description: z.string().describe('A short description of the purchase.'),
});
export type SuggestPurchaseCategoryInput = z.infer<
  typeof SuggestPurchaseCategoryInputSchema
>;

const SuggestPurchaseCategoryOutputSchema = z.object({
  category: z
    .string() 
    .describe('The suggested category for the purchase.'),
});
export type SuggestPurchaseCategoryOutput = z.infer<
  typeof SuggestPurchaseCategoryOutputSchema
>;

export async function suggestPurchaseCategory(
  input: SuggestPurchaseCategoryInput
): Promise<SuggestPurchaseCategoryOutput> {
  return suggestPurchaseCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPurchaseCategoryPrompt',
  input: {schema: SuggestPurchaseCategoryInputSchema},
  output: {schema: SuggestPurchaseCategoryOutputSchema},
  prompt: `You are a helpful assistant that suggests a category for a purchase based on its description.

  Description: {{{description}}}

  Suggest a suitable category for the purchase. Return only the category name. Be concise.`,
});

const suggestPurchaseCategoryFlow = ai.defineFlow(
  {
    name: 'suggestPurchaseCategoryFlow',
    inputSchema: SuggestPurchaseCategoryInputSchema,
    outputSchema: SuggestPurchaseCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
