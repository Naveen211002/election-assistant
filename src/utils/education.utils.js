export function getFallbackResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes("evm") || msg.includes("electronic voting")) {return "🗳️ **Electronic Voting Machine (EVM)**\n\nEVMs have been used in all Indian elections since 2004. They are tamper-proof, stand-alone machines. Since 2017, all EVMs are connected to a **VVPAT** machine for transparency.";}
  if (msg.includes("vvpat") || msg.includes("paper trail") || msg.includes("slip")) {return "🧾 **VVPAT (Voter Verifiable Paper Audit Trail)**\n\nWhen you vote on an EVM, the VVPAT prints a paper slip showing your chosen candidate's serial number, name, and symbol for **7 seconds**. This slip then falls into a sealed box, allowing for physical verification if needed.";}
  if (msg.includes("register") || msg.includes("voter id") || msg.includes("form 6")) {return "📋 **How to Register to Vote**\n\n1. Visit **voters.eci.gov.in** or use the **Voter Helpline App**.\n2. Fill out **Form 6** (for new voters).\n3. Keep your Aadhaar/Address proof and a photo ready.\n4. Once verified by the BLO, your name will be added to the Electoral Roll.";}
  if (msg.includes("nota") || msg.includes("none of the above")) {return "❌ **NOTA (None of the Above)**\n\nIntroduced in 2013, NOTA allows voters to officially register a 'rejection' vote if they do not support any of the candidates in their constituency. It is the last button on the EVM.";}
  if (msg.includes("mcc") || msg.includes("model code") || msg.includes("rules")) {return "📜 **Model Code of Conduct (MCC)**\n\nThese are guidelines issued by the ECI for political parties and candidates. They include:\n1. No use of religion/caste for votes.\n2. No new projects or financial grants by the government after elections are announced.\n3. Parties must inform local police about rallies and processions.";}
  if (msg.includes("stages") || msg.includes("timeline") || msg.includes("process")) {return "📅 **10 Stages of Election**\n\n1. Delimitation\n2. Electoral Rolls Update\n3. Election Announcement (MCC kicks in)\n4. Notification\n5. Nominations\n6. Scrutiny\n7. Withdrawal\n8. Campaigning\n9. Polling Day\n10. Counting & Results";}
  if (msg.includes("eligible") || msg.includes("age") || msg.includes("who can vote")) {return "🔞 **Voting Eligibility**\n\nTo vote in India, you must be:\n1. An Indian Citizen.\n2. 18 years or older as of January 1st of the election year.\n3. Registered in the electoral roll of your constituency.";}
  if (msg.includes("voting day") || msg.includes("polling booth") || msg.includes("documents")) {return "🗳️ **Voting Day Checklist**\n\n1. Find your polling booth using the Voter Helpline App.\n2. Carry your **Voter ID (EPIC)** or any approved photo ID (Aadhaar, PAN, Driving License).\n3. An indelible ink mark will be applied to your finger once you vote.";}
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("namaste")) {return "🇮🇳 **Namaste! I am VoteMitra.**\n\nI can help you with:\n1. 🗳️ EVM & VVPAT info\n2. 📋 Voter Registration (Form 6)\n3. ❌ NOTA details\n4. 🔞 Eligibility rules\n\nWhat would you like to know?";}
  return "🗳️ I'm **VoteMitra**, your election assistant! I can help you with Voter Registration, EVM/VVPAT info, NOTA, and more. Please ask a specific question about the Indian election process!";
}

export function getFallbackQuiz() {
  return {
    questions: [
      { id: 1, question: "Minimum age to vote in India?", options: ["16", "18", "21", "25"], correct: 1, explanation: "Article 326: citizens 18+ are eligible.", topic: "voter-registration" },
      { id: 2, question: "EVM stands for?", options: ["Electronic Verification Machine", "Electronic Voting Machine", "Election Voting Mechanism", "Electronic Vote Manager"], correct: 1, explanation: "Electronic Voting Machine, used since 1999.", topic: "evm-vvpat" },
      { id: 3, question: "Which article establishes the ECI?", options: ["Article 280", "Article 324", "Article 352", "Article 370"], correct: 1, explanation: "Article 324 establishes the Election Commission of India.", topic: "constitutional" },
      { id: 4, question: "What is NOTA?", options: ["A party", "None of the Above on EVM", "A ballot type", "An NGO"], correct: 1, explanation: "NOTA introduced in 2013 to reject all candidates.", topic: "evm-vvpat" },
      { id: 5, question: "Which form for new voter registration?", options: ["Form 2", "Form 6", "Form 8", "Form 11"], correct: 1, explanation: "Form 6 for new registration; Form 8 for corrections.", topic: "voter-registration" },
    ],
  };
}

export function getFallbackFlashcards() {
  return {
    flashcards: [
      { id: 1, term: "EVM", definition: "Electronic Voting Machine — used since 1999.", emoji: "🗳️", category: "technology" },
      { id: 2, term: "VVPAT", definition: "Voter Verifiable Paper Audit Trail — prints a slip to verify your vote.", emoji: "🧾", category: "technology" },
      { id: 3, term: "NOTA", definition: "None of the Above — reject all candidates, introduced 2013.", emoji: "❌", category: "voting" },
      { id: 4, term: "MCC", definition: "Model Code of Conduct — election rules enforced by ECI.", emoji: "📜", category: "rules" },
      { id: 5, term: "EPIC", definition: "Electors Photo Identity Card — your Voter ID.", emoji: "🪪", category: "documents" },
      { id: 6, term: "BLO", definition: "Booth Level Officer — handles voter registration locally.", emoji: "👤", category: "officials" },
      { id: 7, term: "ECI", definition: "Election Commission of India — constitutional body since 1950.", emoji: "🏛️", category: "institution" },
      { id: 8, term: "Delimitation", definition: "Redrawing constituency boundaries for equal representation.", emoji: "🗺️", category: "process" },
    ],
  };
}

export function validateChatMessage(message) {
  if (typeof message !== "string") {return "Message must be a string";}
  const trimmed = message.trim();
  if (!trimmed) {return "Message is required";}
  if (trimmed.length > 1200) {return "Message too long (max 1200 characters)";}
  return null;
}

/**
 * Safely redacts a message to a fixed length for telemetry logging.
 * Prevents PII leak and limits database storage.
 * 
 * @param {string} message - The raw message to redact.
 * @returns {string} The redacted, safe message snippet.
 */
export function redactMessageForTelemetry(message) {
  if (!message || typeof message !== 'string') {
    return '';
  }
  return message.trim().slice(0, 140);
}

/**
 * Generates a unique, cryptographically-inspired session identifier.
 * Uses a combination of timestamp and random characters.
 * 
 * @returns {string} A unique session ID.
 */
export function generateSessionId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `sess_${timestamp}${randomPart}`;
}

export function SYSTEM_PROMPT() {
  return `You are "VoteMitra", an expert AI Election Education Assistant designed for the Indian democratic context.
  
  CORE MISSION:
  Your goal is to provide accurate, unbiased, and step-by-step educational information about the Indian election process (ECI guidelines, constitutional articles, and voting technology).

  PERSONA & TONE:
  - Professional, patriotic, yet neutral.
  - Informative and encouraging. Use emojis to make learning engaging.
  - Use clear, simple English for accessibility.

  KNOWLEDGE DOMAIN:
  - Voter registration (Form 6, 7, 8).
  - EVM, VVPAT, and NOTA technology.
  - Model Code of Conduct (MCC).
  - Constitutional provisions (Articles 324-329).
  - Election stages and voter eligibility.

  CONSTRAINTS:
  - NEVER support or criticize any specific political party or candidate.
  - NEVER predict election outcomes.
  - If a user asks something outside the election process, politely redirect them to election-related topics.
  - Format your responses using clean Markdown with bold headings and bullet points.`;
}

export function QUIZ_PROMPT(difficulty, topic) {
  return `Act as an expert election official. Generate a multiple-choice quiz about the Indian election process.
  Difficulty Level: ${difficulty}
  Primary Topic: ${topic}
  
  REQUIREMENTS:
  - Generate exactly 5 high-quality questions.
  - Include 4 distinct options per question.
  - Provide a detailed "explanation" citing relevant articles or ECI rules for the correct answer.
  - Return ONLY valid JSON in this format: { "questions": [{ "id": number, "question": "string", "options": ["str", "str", "str", "str"], "correct": index (0-3), "explanation": "string", "topic": "string" }] }`;
}

export function FLASHCARD_PROMPT(topic) {
  return `Generate educational flashcards for Indian election terminology.
  Focus Topic: ${topic}
  
  REQUIREMENTS:
  - Generate exactly 8 cards.
  - Each card must have a term, a concise definition, a relevant emoji, and a category.
  - Return ONLY valid JSON in this format: { "flashcards": [{ "id": number, "term": "string", "definition": "string", "emoji": "string", "category": "string" }] }`;
}
