import NodeCache from "node-cache";
import { generateJsonContent } from "../services/gemini.service.js";
import { logger } from "../services/logger.service.js";
import { QUIZ_PROMPT, FLASHCARD_PROMPT, getFallbackQuiz, getFallbackFlashcards } from "../utils/education.utils.js";

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

/**
 * Quiz & Flashcard Controller
 */
export const educationController = {
/**
 * Fetches a quiz from cache or generates it using AI.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
  getQuiz: async (req, res) => {
    const { difficulty, topic } = req.body;
    const cacheKey = `quiz_${difficulty || 'med'}_${topic || 'gen'}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info("Cache Hit: Quiz", { cacheKey });
      return res.json(cached);
    }

    try {
      const prompt = QUIZ_PROMPT(difficulty, topic);
      const quiz = await generateJsonContent(prompt);
      cache.set(cacheKey, quiz);
      res.json(quiz);
    } catch (err) {
      logger.error("Quiz Controller Error, using fallback", { error: err.message });
      res.json(getFallbackQuiz());
    }
  },

/**
 * Fetches educational flashcards from cache or generates them using AI.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
  getFlashcards: async (req, res) => {
    const { topic } = req.body;
    const cacheKey = `flash_${topic || 'gen'}`;

    const cached = cache.get(cacheKey);
    if (cached) {return res.json(cached);}

    try {
      const prompt = FLASHCARD_PROMPT(topic);
      const flashcards = await generateJsonContent(prompt);
      cache.set(cacheKey, flashcards);
      res.json(flashcards);
    } catch (err) {
      logger.error("Flashcard Controller Error, using fallback", { error: err.message });
      res.json(getFallbackFlashcards());
    }
  }
};
