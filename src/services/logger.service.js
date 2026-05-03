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
    const logInstance = getLog();
    const entry = logInstance.entry({ severity: "INFO", ...metadata }, { message, service: "votemitra" });
    if (config.NODE_ENV === 'production') {
      log.write(entry).catch(console.error);
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
    const logInstance = getLog();
    const entry = logInstance.entry({ severity: "ERROR", ...metadata }, { message, service: "votemitra" });
    if (config.NODE_ENV === 'production') {
      log.write(entry).catch(console.error);
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
    const logInstance = getLog();
    const entry = logInstance.entry({ severity: "WARNING", ...metadata }, { message, service: "votemitra" });
    if (config.NODE_ENV === 'production') {
      log.write(entry).catch(console.error);
    } else {
      console.warn(JSON.stringify({ severity: "WARNING", message, ...metadata }));
    }
  }
};
