import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAdvice = async (topic: string, context: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Embedded AI Engineer specializing in C++, NCNN, and Speech Recognition (Icefall/Sherpa).
      
      Topic: ${topic}
      Context: ${context}
      
      Provide a concise, technical, and actionable explanation or advice. Focus on memory management and performance for a low-power Intel Atom device with 200MB RAM.`,
    });
    return response.text || "No advice generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating advice. Please check your API key.";
  }
};

export const chatWithExpert = async (history: { role: string, content: string }[], message: string): Promise<string> => {
   try {
    const ai = getAiClient();
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a Senior C++ Systems Programmer and AI Engineer. You are helping a user deploy a Tiny Zipformer model on an embedded Linux device (Busybox, no glibc bloat). Be terse, technical, and precise.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Error communicating with the expert agent.";
  }
}