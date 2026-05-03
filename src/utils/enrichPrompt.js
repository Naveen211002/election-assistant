/**
 * Analyzes the user's message to detect intent and provide relevant educational context.
 * This simulates a context-enrichment layer for the AI.
 * 
 * @param {string} message - The raw user input message.
 * @returns {{intent: string, context: string}} An object containing the detected intent and a context summary.
 */
function enrichPrompt(message) {
  const msg = (message || "").toLowerCase();
  let intent = "general";
  let context = "General election inquiry.";

  if (msg.includes("register") || msg.includes("form 6")) {
    intent = "voter_registration";
    context = "User is asking about the registration process, Form 6, and eligibility rules.";
  } else if (msg.includes("evm") || msg.includes("vvpat") || msg.includes("machine")) {
    intent = "voting_technology";
    context = "User is inquiring about EVMs, VVPAT verification, and technical election integrity.";
  } else if (msg.includes("nota") || msg.includes("none of the above")) {
    intent = "nota_option";
    context = "User wants to understand the NOTA (None of the Above) provision on the ballot.";
  } else if (msg.includes("poll") || msg.includes("booth") || msg.includes("where")) {
    intent = "polling_logistics";
    context = "User is looking for polling station details, voting day procedures, or location finding.";
  }

  return { intent, context };
}

export { enrichPrompt };
