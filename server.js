/**
 * @fileoverview Application entry point for the VoteMitra Election Assistant.
 * Boots the Express application and initializes the global configuration.
 * 
 * @author VoteMitra Team
 * @version 1.0.1
 */

import { createApp } from "./src/app.js";
import { config } from "./src/config/config.js";
import { logger } from "./src/services/logger.service.js";

/** @constant {import('express').Application} app - The initialized Express application instance. */
const app = createApp();

/**
 * Starts the HTTP server on the configured port.
 * Excludes execution during test runs to allow for supertest integration.
 */
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.PORT, () => {
    logger.info(`Server started on port ${config.PORT}`, { 
      mode: config.NODE_ENV,
      pid: process.pid 
    });
  });
}

export { app };
