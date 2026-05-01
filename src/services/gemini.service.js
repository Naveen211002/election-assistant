import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/config.js";
import { logger } from "./logger.service.js";

let genAI;

const MODEL_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
];

/**
 * Initializes the Gemini AI client.
 */
async function initClient() {
  if (genAI) return genAI;

  const apiKey = await config.getGeminiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set or could not be fetched from Secret Manager");
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  logger.info("Gemini AI Client Initialized");
  return genAI;
}

/**
 * Executes a Gemini API call with model fallback logic.
 */
async function executeWithModelFallback(buildApiCall) {
  await initClient();
  let lastError;

  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
          topP: 0.9,
        }
      });
      
      const result = await buildApiCall(model, modelName);
      if (modelName !== MODEL_CHAIN[0]) {
        logger.info(`Used fallback model: ${modelName}`);
      }
      return result;
    } catch (error) {
      const isOverloaded = 
        error.message.includes("503") || 
        error.message.includes("429") || 
        error.message.includes("overloaded") || 
        error.message.includes("404 Not Found") ||
        error.message.includes("UNAVAILABLE");
        
      lastError = error;
      
      if (isOverloaded) {
        logger.warn(`Model ${modelName} unavailable, trying next...`, { error: error.message });
        continue;
      }
      
      throw error; // Throw non-retryable errors immediately
    }
  }
  
  throw lastError; // All models failed
}

/**
 * Streams a chat response from Gemini.
 * @param {Array} history - Chat history.
 * @param {string} message - User message.
 * @returns {AsyncGenerator} The stream of responses.
 */
export async function* streamChatResponse(history, message) {
  try {
    const result = await executeWithModelFallback(async (model) => {
      const chat = model.startChat({ history });
      return await chat.sendMessageStream(message);
    });

    for await (const chunk of result.stream) {
      if (chunk.text) {
        yield chunk.text();
      }
    }
  } catch (err) {
    logger.error("Gemini Stream Error", { error: err.message });
    throw err;
  }
}

/**
 * Generates JSON content (for quizzes/flashcards).
 * @param {string} prompt - The prompt.
 * @returns {Promise<Object>} The parsed JSON response.
 */
export async function generateJsonContent(prompt) {
  try {
    const result = await executeWithModelFallback(async (model) => {
      const jsonModel = genAI.getGenerativeModel({
        model: model.model,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.8,
        }
      });
      return await jsonModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
    });
    
    const response = result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (err) {
    logger.error("Gemini JSON Generation Error", { error: err.message });
    throw err;
  }
}
