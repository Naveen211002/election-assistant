import { streamChatResponse } from "../services/gemini.service.js";
import { logToBigQuery } from "../services/telemetry.service.js";
import { logger } from "../services/logger.service.js";
import { sanitize } from "../utils/sanitizer.js";
import { enrichPrompt } from "../utils/enrichPrompt.js";
import { getFallbackResponse } from "../utils/education.utils.js";

const chatSessions = new Map();

/**
 * Chat Controller
 */
export const chatController = {
  /**
   * Handles interactive chat requests using Server-Sent Events (SSE).
   * Implements an AI-first strategy with a robust local fallback.
   * 
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {Promise<void>}
   */
  handleChat: async (req, res) => {
    const { message, sessionId } = req.body;
    const sid = sessionId || `sess_${Date.now()}`;
    const startTime = Date.now();
    
    // Set headers for SSE streaming immediately
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let intent = "unknown";
    try {
      const enrichment = enrichPrompt(message);
      intent = enrichment.intent;
      const context = enrichment.context;

      logger.info("Chat Request", { sessionId: sid, intent });

      const history = chatSessions.get(sid) || [
        { role: "user", parts: [{ text: `You are VoteMitra... ${context}` }] },
        { role: "model", parts: [{ text: "Namaste!" }] }
      ];

      let fullReply = "";
      
      try {
        const stream = streamChatResponse(history, message);
        for await (const chunk of stream) {
          const sanitizedChunk = sanitize(chunk);
          fullReply += sanitizedChunk;
          res.write(`data: ${JSON.stringify({ chunk: sanitizedChunk })}\n\n`);
          if (res.flush) {res.flush();}
        }
      } catch (aiError) {
        // FALLBACK MECHANISM: If AI fails (rate limits, offline), use local fallback
        logger.warn("AI Model unavailable, using local fallback", { error: aiError.message });
        const fallbackReply = getFallbackResponse(message);
        fullReply = sanitize(fallbackReply);
        
        // Simulate streaming for the fallback response
        const words = fullReply.split(" ");
        for (const word of words) {
          res.write(`data: ${JSON.stringify({ chunk: word + " " })}\n\n`);
          if (res.flush) {res.flush();}
          await new Promise(r => setTimeout(r, 20)); // slight delay for stream effect
        }
      }

      // Update session history
      history.push({ role: "user", parts: [{ text: message }] });
      history.push({ role: "model", parts: [{ text: fullReply }] });
      chatSessions.set(sid, history.slice(-10)); // Keep last 10 turns

      res.write(`data: [DONE]\n\n`);
      if (res.flush) {res.flush();}
      res.end();

      // Background telemetry
      const latencyMs = Date.now() - startTime;
      logToBigQuery({
        sessionId: sid,
        userMessage: message,
        modelReply: fullReply,
        intent,
        latencyMs
      });

    } catch (err) {
      logger.error("Chat Controller Fatal Error", { error: err.message, sessionId: sid });
      res.write(`data: ${JSON.stringify({ chunk: "I'm having trouble understanding right now. Please check your connection and try again." })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      if (res.flush) {res.flush();}
      res.end();
    }
  }
};

