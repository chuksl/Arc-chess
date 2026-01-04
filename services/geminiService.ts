
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiMoveResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGeminiChessMove = async (
  fen: string,
  history: string[],
  difficulty: 'easy' | 'medium' | 'hard' = 'hard'
): Promise<GeminiMoveResponse> => {
  const model = 'gemini-3-pro-preview';
  
  const systemPrompt = `You are a Grandmaster-level chess engine. 
  Your task is to analyze the current board in FEN format and the move history, then provide the best legal move.
  Return your response in JSON format.
  Difficulty Level: ${difficulty}. 
  History: ${history.join(', ')}`;

  const prompt = `Current FEN: ${fen}. Provide the best move for the side to act.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: { type: Type.STRING, description: "UCI format move, e.g., 'e2e4' or 'g1f3'" },
            explanation: { type: Type.STRING, description: "Brief explanation of the tactical reasoning" },
            evaluation: { type: Type.NUMBER, description: "Evaluation score from White's perspective" }
          },
          required: ["move", "explanation", "evaluation"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as GeminiMoveResponse;
  } catch (error) {
    console.error("Gemini Move Error:", error);
    // Fallback if API fails or rate limits
    throw error;
  }
};

export const analyzeGamePosition = async (fen: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Analyze this chess position (FEN: ${fen}) and describe the key strategic themes for both sides in two sentences.`;
  
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch {
    return "Strategic analysis unavailable.";
  }
};
