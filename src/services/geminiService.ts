import type { StockDataPoint } from '../types';

async function requestInsight(payload: Record<string, unknown>): Promise<string> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
  const result: { text?: string } = await response.json();
  return result.text || 'Response unavailable.';
}

export const getMarketAnalysis = async (data: StockDataPoint[], symbol: string): Promise<string> => {
  try {
    return await requestInsight({ type: 'market', data: data.slice(-10), symbol });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'AI Analysis service is temporarily unavailable.';
  }
};

export const getArchitectureExplanation = async (component: string): Promise<string> => {
  try {
    return await requestInsight({ type: 'architecture', component });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Info service unavailable.';
  }
};
