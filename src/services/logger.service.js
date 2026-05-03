import { Logging } from "@google-cloud/logging";
import { config } from "../config/config.js";

let logging = null;
let log = null;
const logName = "election-assistant-logs";

function getLog() {
  if (!logging) {
    logging = new Logging({ projectId: config.GCP_PROJECT_ID });
    log = logging.log(logName);
  }
  return log;
}

/**
 * Formats a log entry for consistent structured logging.
 * 
 * @param {string} severity - Log severity (INFO, ERROR, etc.).
 * @param {string} message - Main log message.
 * @param {Object} metadata - Additional structured data.
 * @returns {Object} Formatted entry.
 */
function createEntry(severity, message, metadata) {
  const logInstance = getLog();
  // Ensure log is initialized via getLog()
  return logInstance.entry(
    { severity, ...metadata }, 
    { message, service: "votemitra", timestamp: new Date().toISOString() }
  );
}

/**
 * Structured logger that integrates with Google Cloud Logging.
 */
export const logger = {
  /**
   * Logs an informational message.
   * 
   * @param {string} message - The message to log.
   * @param {Object} [metadata={}] - Optional structured metadata.
   */
  info: (message, metadata = {}) => {
    if (config.NODE_ENV === 'production') {
      const logInstance = getLog();
      const entry = createEntry("INFO", message, metadata);
      logInstance.write(entry).catch(() => {});
    } else {
      console.log(JSON.stringify({ severity: "INFO", message, ...metadata }));
    }
  },

  /**
   * Logs an error message.
   * 
   * @param {string} message - The error message.
   * @param {Object} [metadata={}] - Optional structured metadata.
   */
  error: (message, metadata = {}) => {
    if (config.NODE_ENV === 'production') {
      const logInstance = getLog();
      const entry = createEntry("ERROR", message, metadata);
      logInstance.write(entry).catch(() => {});
    } else {
      console.error(JSON.stringify({ severity: "ERROR", message, ...metadata }));
    }
  },

  /**
   * Logs a warning message.
   * 
   * @param {string} message - The warning message.
   * @param {Object} [metadata={}] - Optional structured metadata.
   */
  warn: (message, metadata = {}) => {
    if (config.NODE_ENV === 'production') {
      const logInstance = getLog();
      const entry = createEntry("WARNING", message, metadata);
      logInstance.write(entry).catch(() => {});
    } else {
      console.warn(JSON.stringify({ severity: "WARNING", message, ...metadata }));
    }
  }
};
