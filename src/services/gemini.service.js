import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/config.js";
import { logger } from "./logger.service.js";

let genAI;

const MODEL_CHAIN = [
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-flash-latest",
];

/**
 * Initializes the Gemini AI client.
 */
async function initClient() {
  if (genAI) {return genAI;}

  const apiKey = await config.getGeminiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set or could not be fetched from Secret Manager");
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  logger.info("Gemini AI Client Initialized");
  return genAI;
}

/** @constant {number} The maximum number of tokens to generate in a single response. */
const MAX_OUTPUT_TOKENS = 1024;
/** @constant {number} The temperature setting for AI creativity (0.0 to 1.0). */
const AI_TEMPERATURE = 0.7;
/** @constant {number} The Top-P setting for AI nucleus sampling. */
const AI_TOP_P = 0.9;

const DEFAULT_GENERATION_CONFIG = {
  maxOutputTokens: MAX_OUTPUT_TOKENS,
  temperature: AI_TEMPERATURE,
  topP: AI_TOP_P,
};

/** @constant {number} The temperature setting for JSON generation tasks. */
const JSON_TEMPERATURE = 0.8;

const JSON_GENERATION_CONFIG = {
  responseMimeType: "application/json",
  temperature: JSON_TEMPERATURE,
};

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
        generationConfig: DEFAULT_GENERATION_CONFIG
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
 * 
 * @param {Array<Object>} history - The chat history.
 * @param {string} message - The user's new message.
 * @yields {string} Chunks of the AI response.
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
 * Generates structured JSON content using Gemini.
 * 
 * @param {string} prompt - The prompt for the AI.
 * @returns {Promise<Object>} The parsed JSON response.
 */
export async function generateJsonContent(prompt) {
  try {
    const result = await executeWithModelFallback(async (model) => {
      const jsonModel = genAI.getGenerativeModel({
        model: model.model,
        generationConfig: JSON_GENERATION_CONFIG
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
