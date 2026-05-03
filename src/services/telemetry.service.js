import { BigQuery } from "@google-cloud/bigquery";
import { config } from "../config/config.js";
import { logger } from "./logger.service.js";

let bigquery = null;

/**
 * Logs interaction data to BigQuery.
 * @param {Object} data - Telemetry data.
 */
/**
 * Logs interaction telemetry to Google BigQuery.
 * 
 * @param {Object} data - The telemetry data object.
 * @param {string} data.sessionId - Unique session identifier.
 * @param {string} data.userMessage - The raw user message.
 * @param {string} data.modelReply - The AI's response.
 * @param {string} data.intent - The detected intent.
 * @param {number} data.latencyMs - The time taken to respond.
 * @returns {Promise<void>}
 */
export async function logToBigQuery(data) {
  if (config.NODE_ENV !== 'production') {
    return;
  }
  
  try {
    if (!bigquery) {
      bigquery = new BigQuery({ projectId: config.GCP_PROJECT_ID });
    }
    const dataset = bigquery.dataset(config.BIGQUERY_DATASET);
    const table = dataset.table(config.BIGQUERY_TABLE);
    
    await table.insert([{
      session_id: data.sessionId,
      timestamp: new Date().toISOString(),
      user_message: data.userMessage?.substring(0, 1000),
      model_reply: data.modelReply?.substring(0, 3000),
      intent: data.intent || "general",
      latency_ms: data.latencyMs || 0,
      tokens: data.tokens || 0,
      feedback: data.feedback || null
    }]);
  } catch (err) {
    logger.warn("BigQuery Logging Failed", { error: err.message });
  }
}
