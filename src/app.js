import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { logger } from './services/logger.service.js';
import apiRoutes from './routes/api.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Application factory function.
 * Creates and configures the Express application.
 * @returns {import('express').Application} The configured Express app.
 */
export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  // -- Security Middleware --
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  }));

  app.disable('x-powered-by');

  // -- CORS Configuration --
  const ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'https://election-assistant-146307955970.us-central1.run.app',
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));

  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  // -- Rate Limiting --
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', apiLimiter);

  // -- Static Files --
  app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: 0,
    etag: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    },
  }));

  // -- API Routes --
  app.use('/api', apiRoutes);

  // -- SPA Fallback --
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });

  // -- Global Error Handler --
  app.use((err, req, res, _next) => {
    logger.error('Unhandled Error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

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
} from "./utils/education.utils.js";
