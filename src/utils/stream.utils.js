/**
 * Formats a data chunk for Server-Sent Events (SSE).
 * 
 * @param {string} event - The event name.
 * @param {Object|string} data - The data to send.
 * @returns {string} The formatted SSE string.
 */
export function formatSSE(event, data) {
  if (event === 'done') {
    return 'data: [DONE]\n\n';
  }
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * Sleeps for a specified duration.
 * Useful for simulating stream effects in fallback mode.
 * 
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
