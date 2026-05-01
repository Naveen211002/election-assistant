import { Logging } from "@google-cloud/logging";
import { config } from "../config/config.js";

const logging = new Logging({ projectId: config.GCP_PROJECT_ID });
const logName = "election-assistant-logs";
const log = logging.log(logName);

/**
 * Structured logger that integrates with Google Cloud Logging.
 */
export const logger = {
  info: (message, metadata = {}) => {
    const entry = log.entry({ severity: "INFO", ...metadata }, { message, service: "votemitra" });
    if (config.NODE_ENV === 'production') {
      log.write(entry).catch(console.error);
    } else {
      console.log(JSON.stringify({ severity: "INFO", message, ...metadata }));
    }
  },
  error: (message, metadata = {}) => {
    const entry = log.entry({ severity: "ERROR", ...metadata }, { message, service: "votemitra" });
    if (config.NODE_ENV === 'production') {
      log.write(entry).catch(console.error);
    } else {
      console.error(JSON.stringify({ severity: "ERROR", message, ...metadata }));
    }
  },
  warn: (message, metadata = {}) => {
    const entry = log.entry({ severity: "WARNING", ...metadata }, { message, service: "votemitra" });
    if (config.NODE_ENV === 'production') {
      log.write(entry).catch(console.error);
    } else {
      console.warn(JSON.stringify({ severity: "WARNING", message, ...metadata }));
    }
  }
};
