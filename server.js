/**
 * @fileoverview Main entry point for the VoteMitra Election Assistant server.
 * Handles middleware configuration, static file serving, and API routing.
 * @author VoteMitra Team
 * @version 1.0.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { config } from "./src/config/config.js";
import { logger } from "./src/services/logger.service.js";
import apiRoutes from "./src/routes/api.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Express application instance
 * @type {import('express').Application}
 */
const app = express();
app.set('trust proxy', 1);

// ── Security Middleware ───────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], 
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));

app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));

// ── Rate Limiting ─────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// ── Static Files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public"), { 
  maxAge: 0, 
  etag: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// ── API Routes ────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ── SPA Fallback ──────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error("Unhandled Error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal Server Error" });
});

// ── Start Server ──────────────────────────────────────────────
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
} from "./src/utils/education.utils.js";
