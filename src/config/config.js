import dotenv from "dotenv";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

dotenv.config();

const client = new SecretManagerServiceClient();

/**
 * Fetches a secret from Google Cloud Secret Manager.
 * Falls back to environment variables in local development.
 * @param {string} secretName - The name of the secret.
 * @returns {Promise<string>} The secret value.
 */
async function getSecret(secretName) {
  // Use local .env if not running in Google Cloud
  if (!process.env.K_SERVICE || process.env.NODE_ENV === 'test') {
    return process.env[secretName];
  }
  
  try {
    const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });
    return version.payload.data.toString();
  } catch (err) {
    console.warn(`[Config] Falling back to env for ${secretName}: ${err.message}`);
    return process.env[secretName];
  }
}

export const config = {
  PORT: process.env.PORT || 8080,
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
  BIGQUERY_DATASET: process.env.BIGQUERY_DATASET || 'election_analytics',
  BIGQUERY_TABLE: process.env.BIGQUERY_TABLE || 'chat_logs',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MAX_MESSAGE_LENGTH: 1200,
  SESSION_TTL: 30 * 60 * 1000,
  getGeminiKey: () => getSecret('GEMINI_API_KEY'),
};
