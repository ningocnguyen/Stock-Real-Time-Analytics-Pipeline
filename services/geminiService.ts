import { GoogleGenAI } from "@google/genai";
import { StockDataPoint } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export const getMarketAnalysis = async (data: StockDataPoint[], symbol: string): Promise<string> => {
  try {
    const recentData = data.slice(-10);
    const prompt = `Act as a senior financial analyst. Analyze the following recent stock market data points (simulated) for ${symbol}.
    Data: ${JSON.stringify(recentData)}
    Provide a concise 2-3 sentence summary of the current trend, mentioning volatility and RSI indicators. No markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Analysis service is temporarily unavailable.";
  }
};

export const getArchitectureExplanation = async (component: string): Promise<string> => {
  try {
    const prompt = `Explain the role of "${component}" in a modern Azure Data Engineering pipeline using Medallion Architecture and Databricks. Keep it under 50 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    return response.text || "Explanation unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Info service unavailable.";
  }
};
