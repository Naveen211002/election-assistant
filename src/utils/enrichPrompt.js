/**
 * Simulated Cloud Function logic for prompt enrichment.
 * Performs intent detection on user messages to provide richer context to the AI.
 * 
 * @param {string} message - The user's input message.
 * @returns {Object} An object containing the detected intent and helpful context.
 */
function enrichPrompt(message) {
  const msg = message.toLowerCase();
  let intent = "general";
  let context = "General election inquiry.";

  if (msg.includes("register")) {
    intent = "voter_registration";
    context = "User wants to know how to register to vote.";
  } else if (msg.includes("deadline")) {
    intent = "deadlines";
    context = "User is asking about election deadlines.";
  } else if (msg.includes("candidate")) {
    intent = "candidates";
    context = "User wants information about candidates.";
  } else if (msg.includes("poll") || msg.includes("booth")) {
    intent = "polling_location";
    context = "User is looking for polling booth information.";
  }

  return { intent, context };
}

export { enrichPrompt };
