import { GoogleGenAI, Type } from "@google/genai";

// FIX: Refactored to align with @google/genai SDK guidelines.
// - Initialized GoogleGenAI client directly using process.env.API_KEY.
// - Removed conditional API key checks and mock data, assuming the key is always available.
// - Updated the responseSchema to remove the 'required' property and add 'propertyOrdering' for better compliance with examples.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface AISubTaskSuggestion {
  title: string;
}

export interface AITaskSuggestion {
  title: string;
  duration: number;
  subTasks: AISubTaskSuggestion[];
}

export const suggestTasks = async (packageTitle: string): Promise<AITaskSuggestion[]> => {
  try {
    const prompt = `Bir şantiye iş paketi için Pomodoro tekniğine uygun, adımlara bölünmüş görevler ve bu görevlere ait alt görevler oluştur. Her ana görev için bir başlık ve tahmini süresini (dakika olarak) belirt. Her alt görev için sadece başlık belirt. İş paketi başlığı: "${packageTitle}". Sadece JSON nesnesi döndür. Örnek: { "tasks": [{"title": "Alan temizliği", "duration": 20, "subTasks": [{"title": "Molozları topla"}, {"title": "Zemini süpür"}] }] }`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the task." },
                    duration: { type: Type.INTEGER, description: "Estimated duration of the task in minutes." },
                    subTasks: {
                        type: Type.ARRAY,
                        description: "A list of sub-tasks for the main task.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "The title of the sub-task." }
                            },
                            propertyOrdering: ["title"]
                        }
                    }
                },
                propertyOrdering: ["title", "duration", "subTasks"]
              },
            },
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    
    if (result.tasks && Array.isArray(result.tasks)) {
      return result.tasks;
    }
    return [];

  } catch (error) {
    console.error("Error generating tasks with Gemini:", error);
    return [];
  }
};