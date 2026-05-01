import express from "express";
import { body, validationResult } from "express-validator";
import { chatController } from "../controllers/chat.controller.js";
import { educationController } from "../controllers/education.controller.js";
import { config } from "../config/config.js";

const router = express.Router();

/**
 * Middleware to handle validation errors.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Health Check
router.get("/health", (req, res) => res.json({ status: "healthy", env: config.NODE_ENV }));

// Chat API
router.post("/chat", 
  [
    body("message").isString().trim().isLength({ min: 1, max: config.MAX_MESSAGE_LENGTH }),
    body("sessionId").optional({ nullable: true }).isString().trim()
  ],
  validate,
  chatController.handleChat
);

// Quiz API
router.post("/quiz",
  [
    body("difficulty").optional().isIn(["easy", "medium", "hard"]),
    body("topic").optional().isString().trim()
  ],
  validate,
  educationController.getQuiz
);

// Flashcard API
router.post("/flashcards",
  [
    body("topic").optional().isString().trim()
  ],
  validate,
  educationController.getFlashcards
);

export default router;
