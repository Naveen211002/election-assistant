import NodeCache from "node-cache";
import { generateJsonContent } from "../services/gemini.service.js";
import { logger } from "../services/logger.service.js";

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

/**
 * Quiz & Flashcard Controller
 */
export const educationController = {
  /**
   * Generates or fetches quiz from cache.
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
      const prompt = `Generate exactly 5 multiple-choice questions about Indian elections. Difficulty: ${difficulty}. Topic: ${topic}. Return JSON: { questions: [{ id, question, options, correct, explanation, topic }] }`;
      const quiz = await generateJsonContent(prompt);
      cache.set(cacheKey, quiz);
      res.json(quiz);
    } catch (err) {
      logger.error("Quiz Controller Error, using fallback", { error: err.message });
      const { getFallbackQuiz } = await import('../utils/legacy.js');
      res.json(getFallbackQuiz());
    }
  },

  /**
   * Generates or fetches flashcards from cache.
   */
  getFlashcards: async (req, res) => {
    const { topic } = req.body;
    const cacheKey = `flash_${topic || 'gen'}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      const prompt = `Generate 8 flashcards about Indian election terms. Topic: ${topic}. Return JSON: { flashcards: [{ id, term, definition, emoji, category }] }`;
      const flashcards = await generateJsonContent(prompt);
      cache.set(cacheKey, flashcards);
      res.json(flashcards);
    } catch (err) {
      logger.error("Flashcard Controller Error, using fallback", { error: err.message });
      const { getFallbackFlashcards } = await import('../utils/legacy.js');
      res.json(getFallbackFlashcards());
    }
  }
};
