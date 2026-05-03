/**
 * @fileoverview Application entry point for the VoteMitra Election Assistant.
 * @author VoteMitra Team
 * @version 1.0.1
 */

import { createApp } from "./src/app.js";
import { config } from "./src/config/config.js";
import { logger } from "./src/services/logger.service.js";

const app = createApp();

// -- Start Server --
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.PORT, () => {
    logger.info(`Server started on port ${config.PORT}`, { 
      mode: config.NODE_ENV,
      pid: process.pid 
    });
  });
}

export { app };

export { 
  validateChatMessage, 
  redactMessageForTelemetry, 
  getFallbackResponse, 
  getFallbackQuiz, 
  getFallbackFlashcards,
  generateSessionId,
  SYSTEM_PROMPT,
  QUIZ_PROMPT,
  FLASHCARD_PROMPT
} from "./src/app.js";
