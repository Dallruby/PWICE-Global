import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { CHARACTERS } from "../constants";

let client: GoogleGenAI | null = null;

// User provided API Key
const API_KEY = 'AIzaSyA3i3sZUFZ1VhaUvDLscJiOc5hLw2e5wDQ';

// Initialize the Gemini client only when needed
const getClient = (): GoogleGenAI => {
  if (!client) {
    // Direct usage for the user's specific request to fix the app
    client = new GoogleGenAI({ apiKey: API_KEY });
  }
  return client;
};

export const createChatSession = (characterId: string): Chat => {
  const ai = getClient();
  const character = CHARACTERS.find(c => c.id === characterId);
  
  if (!character) {
    throw new Error("Character not found");
  }

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: character.systemInstruction,
      temperature: 0.9, // Higher creative/roleplay aspect
      topK: 64,
      topP: 0.95,
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "통신 보안에 문제가 생겼다. 다시 시도해.";
  }
};

// Streaming version
export const sendMessageStream = async function* (chat: Chat, message: string) {
    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
        yield (chunk as GenerateContentResponse).text;
    }
}