"use server";

/**
 * AI Insights stub action.
 * Returns a "coming soon" response — real LLM analysis is Phase 2.
 */

export async function generateAiInsights(
  _prev: unknown,
  _formData: FormData,
): Promise<{ ok: boolean; error?: string; result?: string }> {
  // Phase 2: call an LLM with aggregated spending data.
  return { ok: false, error: "AI Insights coming soon." };
}
