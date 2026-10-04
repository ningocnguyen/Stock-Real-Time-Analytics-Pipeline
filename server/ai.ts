import { GoogleGenAI } from '@google/genai';

type AiResult = { status: number; body: { text?: string; error?: string } };

export async function handleAiRequest(input: unknown, apiKey = process.env.GEMINI_API_KEY): Promise<AiResult> {
  if (!apiKey) return { status: 503, body: { error: 'AI is not configured.' } };
  if (!input || typeof input !== 'object') {
    return { status: 400, body: { error: 'Invalid request.' } };
  }

  const payload = input as Record<string, unknown>;
  let prompt: string;

  if (payload.type === 'market') {
    if (typeof payload.symbol !== 'string' || payload.symbol.length > 12 ||
        !Array.isArray(payload.data) || payload.data.length > 10 ||
        JSON.stringify(payload.data).length > 10_000) {
      return { status: 400, body: { error: 'Invalid market data.' } };
    }
    prompt = `Act as a senior financial analyst. Analyze these simulated stock data points for ${payload.symbol}.
Data: ${JSON.stringify(payload.data)}
Provide a concise 2-3 sentence summary of the current trend, mentioning volatility and RSI. No markdown formatting.`;
  } else if (payload.type === 'architecture') {
    if (typeof payload.component !== 'string' || payload.component.length > 100) {
      return { status: 400, body: { error: 'Invalid component.' } };
    }
    prompt = `Explain the role of "${payload.component}" in an Azure data pipeline using Medallion Architecture and Databricks. Keep it under 50 words.`;
  } else {
    return { status: 400, body: { error: 'Unknown request type.' } };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return { status: 200, body: { text: response.text || 'Response unavailable.' } };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { status: 502, body: { error: 'AI service is temporarily unavailable.' } };
  }
}
