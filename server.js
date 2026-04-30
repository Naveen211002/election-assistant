// ============================================================
// Election Process Education Assistant — Backend Server
// PromptWars Challenge 2 | Google for Developers × Hack2skill
// ============================================================

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";

dotenv.config();

const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MAX_MESSAGE_LENGTH = 1200;

/** 
 * ✅ MODEL FALLBACK CHAIN
 * We use the models that were verified to work with your API key.
 * If one is busy, it automatically tries the next one.
 */
const MODEL_CHAIN = [
  "gemini-3-flash-preview", 
  "gemini-2.5-flash", 
  "gemini-2.0-flash",
  "gemini-flash-latest"
];
const MODEL_NAME = MODEL_CHAIN[0];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Structured Logger ─────────────────────────────────────────
const cloudLogger = {
  info: (msg, meta = {}) => console.log(JSON.stringify({ severity: "INFO", message: msg, ...meta })),
  error: (msg, meta = {}) => console.error(JSON.stringify({ severity: "ERROR", message: msg, ...meta })),
};

// ── Google BigQuery Telemetry (Optional) ─────────────────────
let analyticsWriter = null;
if (process.env.GOOGLE_CLOUD_PROJECT && process.env.BIGQUERY_DATASET && process.env.BIGQUERY_TABLE) {
  try {
    const { BigQuery } = await import("@google-cloud/bigquery");
    const bigquery = new BigQuery({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
    const table = bigquery.dataset(process.env.BIGQUERY_DATASET).table(process.env.BIGQUERY_TABLE);
    analyticsWriter = async (row) => {
      try {
        await table.insert([row]);
      } catch (error) {
        cloudLogger.error("BigQuery insert failed", { error: error.message });
      }
    };
    console.log("✅ BigQuery analytics initialized");
  } catch (error) {
    console.log("ℹ️  BigQuery unavailable, analytics will be skipped");
  }
}

if (!analyticsWriter) {
  analyticsWriter = async () => {};
}

if (!process.env.K_SERVICE) {
  console.log("ℹ️  Local dev mode — using structured console logging");
}

// ── Gemini AI Initialization ─────────────────────────────────
let genAI, model;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: MODEL_NAME });
  console.log("✅ Gemini AI initialized with model:", MODEL_NAME);
} else {
  console.warn("⚠️  GEMINI_API_KEY not set — AI features will use fallback responses");
}

// ── Model Fallback Helper ────────────────────────────────────
// Tries each model in MODEL_CHAIN until one succeeds
async function executeWithModelFallback(buildApiCall) {
  let lastError;
  for (const modelName of MODEL_CHAIN) {
    try {
      const m = genAI.getGenerativeModel({ model: modelName });
      const result = await executeWithRetry(() => buildApiCall(m, modelName));
      if (modelName !== MODEL_NAME) {
        console.log(`✅ Used fallback model: ${modelName}`);
      }
      return result;
    } catch (error) {
      const isOverloaded =
        error.message.includes("503") ||
        error.message.includes("429") ||
        error.message.includes("overloaded") ||
        error.message.includes("UNAVAILABLE");
      lastError = error;
      if (isOverloaded) {
        console.warn(`⚠️ Model ${modelName} unavailable/overloaded, trying next...`);
        continue;
      }
      throw error; // Non-retryable error — don't try next model
    }
  }
  throw lastError;
}

// ── System Prompt ────────────────────────────────────────────
function SYSTEM_PROMPT() {
  return `You are "VoteMitra" (वोट मित्र) — an expert, friendly, and multilingual AI assistant 
specializing in the Indian Election Process. You were created to educate citizens, especially 
first-time voters, about how democracy works in India.

## YOUR IDENTITY
- Name: VoteMitra (meaning "Vote Friend" in Hindi)
- Role: Election Education Assistant
- Tone: Warm, encouraging, patient, and non-partisan
- Language: Respond in English by default. If the user writes in Hindi or Hinglish, respond in the same language style.

## YOUR KNOWLEDGE DOMAIN

### 1. Election Commission of India (ECI)
- Constitutional body under Article 324
- Structure: Chief Election Commissioner + Election Commissioners
- Powers: Conduct free and fair elections, enforce Model Code of Conduct
- Key portals: eci.gov.in, voters service portal

### 2. Types of Elections
- Lok Sabha (General Elections) — 543 constituencies, 5-year term
- Rajya Sabha — indirectly elected, 6-year term, 1/3 retire every 2 years
- State Legislative Assembly (Vidhan Sabha)
- Local Body Elections (Panchayat, Municipal)
- By-elections

### 3. Voter Registration Process
- Eligibility: Indian citizen, 18+ years (as of Jan 1 of revision year)
- Form 6: New voter registration
- Form 6A: NRI voter registration
- Form 7: Deletion of name
- Form 8: Correction of entries
- Required documents: Proof of age (Aadhaar, PAN, birth certificate, Class X marksheet) + Proof of address
- Online registration via Voter Helpline App or Voter Service Portal
- Offline: Submit to Booth Level Officer (BLO)
- EPIC (Voter ID Card) issuance

### 4. The 10-Stage Election Process
Stage 1: Delimitation of Constituencies
Stage 2: Preparation & Revision of Electoral Rolls
Stage 3: Announcement of Election Schedule (MCC kicks in)
Stage 4: Issue of Notification
Stage 5: Filing of Nominations
Stage 6: Scrutiny of Nominations
Stage 7: Withdrawal of Candidature
Stage 8: Election Campaigning
Stage 9: Polling Day — Voting via EVM + VVPAT
Stage 10: Counting & Results

### 5. Key Electoral Concepts
- EVM: M1, M2, M3 versions; tamper-proof
- VVPAT: Paper slip verification
- MCC: Rules during election period
- NOTA: Option on EVM since 2013
- Postal Ballot: For armed forces, government officials on duty
- Form 17C: Account of votes recorded at each polling station

### 6. Constitutional Articles
- Article 324: Election Commission establishment
- Article 325: No discrimination on electoral roll
- Article 326: Adult suffrage
- Article 327-329: Parliament's legislative powers

### 7. Practical Voter Information
- Find polling booth: Voter Helpline App or eci.gov.in
- Carry on voting day: Voter ID (EPIC) or 12 approved photo ID alternatives
- Voting process: Queue → verification → ink marking → EVM → VVPAT slip check

## RESPONSE RULES
1. ALWAYS be non-partisan
2. Cite articles, forms, sources when possible
3. Use bullet points and numbered lists for clarity
4. Break complex topics into simple steps
5. If asked outside elections, politely redirect
6. Encourage voter participation
7. Use emojis sparingly: 🗳️ ✅ 📋 🇮🇳
8. If unsure, say so honestly
9. Keep responses 200-400 words
10. End with a helpful follow-up suggestion`;
}

// ── Quiz Prompt ──────────────────────────────────────────────
function QUIZ_PROMPT(difficulty, topic) {
  return `Generate exactly 5 multiple-choice quiz questions about the Indian election process.

PARAMETERS:
- Difficulty: ${difficulty || "medium"}
- Topic Focus: ${topic || "general"}

RESPONSE FORMAT (strict JSON only, no markdown):
{
  "questions": [
    {
      "id": 1,
      "question": "question text?",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "why this is correct",
      "topic": "topic-tag"
    }
  ]
}

Return ONLY valid JSON, no extra text.`;
}

// ── Flashcard Prompt ─────────────────────────────────────────
function FLASHCARD_PROMPT(topic) {
  return `Generate exactly 8 educational flashcards about Indian election terminology.

TOPIC FOCUS: ${topic || "general"}

RESPONSE FORMAT (strict JSON only, no markdown):
{
  "flashcards": [
    {
      "id": 1,
      "term": "term or acronym",
      "definition": "clear definition (1-2 sentences)",
      "emoji": "relevant emoji",
      "category": "category-tag"
    }
  ]
}

Return ONLY valid JSON, no extra text.`;
}

function validateChatMessage(message) {
  if (typeof message !== "string") return "Message must be a string";
  const trimmed = message.trim();
  if (!trimmed) return "Message is required";
  if (trimmed.length > MAX_MESSAGE_LENGTH) return `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`;
  return null;
}

function redactMessageForTelemetry(message) {
  if (!message) return "";
  // Keep lightweight, privacy-aware analytics by storing only a preview.
  return message.trim().slice(0, 140);
}

function trackEvent(eventType, data = {}) {
  const payload = {
    eventType,
    timestamp: new Date().toISOString(),
    service: "votemitra",
    ...data,
  };
  cloudLogger.info(`analytics:${eventType}`, payload);
  void analyticsWriter(payload);
}

// ── Chat Sessions ────────────────────────────────────────────
const chatSessions = new Map();
const SESSION_TTL = 30 * 60 * 1000;

// ── Retry Helper ─────────────────────────────────────────────
// ✅ FIXED: correct loop that sleeps before throwing on final attempt
async function executeWithRetry(apiCall, maxRetries = 2) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      const isRetryable =
        error.message.includes("503") ||
        error.message.includes("429") ||
        error.message.includes("overloaded") ||
        error.message.includes("UNAVAILABLE");

      if (!isRetryable || attempt === maxRetries) throw error;

      const jitter = Math.random() * 1000;
      const delay = Math.pow(2, attempt) * 1000 + jitter; // 2-3s, 4-5s
      console.warn(`⚠️ Retry ${attempt}/${maxRetries}: Model busy — waiting ${Math.round(delay)}ms`);
      cloudLogger.info(`API Retry ${attempt}`, { error: error.message });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// Cleanup expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of chatSessions) {
    if (now - session.lastActive > SESSION_TTL) chatSessions.delete(id);
  }
}, 10 * 60 * 1000);

// ── Express App ──────────────────────────────────────────────
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", apiLimiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    cloudLogger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: Date.now() - start,
    });
  });
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1d", etag: true }));

// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "VoteMitra Election Assistant",
    model: MODEL_NAME,
    aiEnabled: !!GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/ready", (req, res) => {
  const bigQueryConfigured = Boolean(
    process.env.GOOGLE_CLOUD_PROJECT &&
      process.env.BIGQUERY_DATASET &&
      process.env.BIGQUERY_TABLE,
  );
  const ready = true;
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not-ready",
    checks: {
      webServer: true,
      aiConfigured: Boolean(GEMINI_API_KEY),
      bigQueryConfigured,
    },
    timestamp: new Date().toISOString(),
  });
});

// ── Chat API ─────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;
  const sid = sessionId || generateSessionId();

  try {
    const validationError = validateChatMessage(message);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    if (!model) {
      trackEvent("chat_fallback_local", { sessionId: sid, messagePreview: redactMessageForTelemetry(message) });
      return res.json({ reply: getFallbackResponse(message), sessionId: sid, source: "fallback" });
    }

    let session = chatSessions.get(sid);
    if (!session) {
      session = {
        chat: model.startChat({
          history: [
            { role: "user", parts: [{ text: "You are VoteMitra, an expert election education assistant for Indian elections. " + SYSTEM_PROMPT() }] },
            { role: "model", parts: [{ text: "Namaste! 🇮🇳 I am VoteMitra — your Election Education Assistant." }] },
          ],
          generationConfig: { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 1024 },
        }),
        lastActive: Date.now(),
      };
      chatSessions.set(sid, session);
    }

    session.lastActive = Date.now();
    
    // Use model fallback chain
    const result = await executeWithModelFallback((m) => {
      const chatSession = m === model ? session.chat : m.startChat({
        history: [
          { role: "user", parts: [{ text: "You are VoteMitra... " + SYSTEM_PROMPT() }] },
          { role: "model", parts: [{ text: "Namaste! 🇮🇳 I am VoteMitra." }] },
        ],
        generationConfig: { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 1024 },
      });
      return chatSession.sendMessage(message.trim());
    });
    const reply = result.response.text();
    trackEvent("chat_success", {
      sessionId: sid,
      source: "gemini",
      responseLength: reply.length,
      messagePreview: redactMessageForTelemetry(message),
    });

    res.json({ reply, sessionId: sid, source: "gemini" });
  } catch (error) {
    console.warn("AI Quota/Overload hit — triggering safety fallback response");
    cloudLogger.error("Chat API Safety Fallback", { error: error.message });
    
    // FINAL SAFETY NET: If AI fails, return a smart local response
    const fallbackReply = getFallbackResponse(message);
    trackEvent("chat_safety_fallback", {
      sessionId: sid,
      source: "safety-fallback",
      error: error.message,
      messagePreview: redactMessageForTelemetry(message),
    });
    res.json({ 
      reply: fallbackReply, 
      sessionId: sid, 
      source: "safety-fallback",
      note: "API Busy - served from local knowledge" 
    });
  }
});

// ── Quiz API ─────────────────────────────────────────────────
app.post("/api/quiz", async (req, res) => {
  try {
    const { difficulty, topic } = req.body;
    if (!model) return res.json(getFallbackQuiz());

    const result = await executeWithModelFallback((m) => {
      const quizModel = genAI.getGenerativeModel({
        model: m.model || MODEL_NAME,
        generationConfig: { temperature: 0.8, topP: 0.95, maxOutputTokens: 2048, responseMimeType: "application/json" },
      });
      return quizModel.generateContent(QUIZ_PROMPT(difficulty, topic));
    });
    const quiz = JSON.parse(result.response.text());
    trackEvent("quiz_success", {
      source: "gemini",
      difficulty: difficulty || "medium",
      topic: topic || "general",
      questionCount: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
    });
    res.json(quiz);
  } catch (error) {
    console.error("Quiz API Error:", error.message);
    cloudLogger.error("Quiz API Error", { error: error.message });
    trackEvent("quiz_fallback", { source: "fallback", error: error.message });
    res.json(getFallbackQuiz());
  }
});

// ── Flashcard API ────────────────────────────────────────────
app.post("/api/flashcards", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!model) return res.json(getFallbackFlashcards());

    const result = await executeWithModelFallback((m) => {
      const flashModel = genAI.getGenerativeModel({
        model: m.model || MODEL_NAME,
        generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 2048, responseMimeType: "application/json" },
      });
      return flashModel.generateContent(FLASHCARD_PROMPT(topic));
    });
    const flashcards = JSON.parse(result.response.text());
    trackEvent("flashcards_success", {
      source: "gemini",
      topic: topic || "general",
      flashcardCount: Array.isArray(flashcards.flashcards) ? flashcards.flashcards.length : 0,
    });
    res.json(flashcards);
  } catch (error) {
    console.error("Flashcard API Error:", error.message);
    cloudLogger.error("Flashcard API Error", { error: error.message });
    trackEvent("flashcards_fallback", { source: "fallback", error: error.message });
    res.json(getFallbackFlashcards());
  }
});

// ── Fallback Data ────────────────────────────────────────────
function getFallbackResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes("evm") || msg.includes("electronic voting")) {
    return "🗳️ **Electronic Voting Machine (EVM)**\n\nEVMs have been used in all Indian elections since 2004. They are tamper-proof, stand-alone machines. Since 2017, all EVMs are connected to a **VVPAT** machine for transparency.";
  }
  if (msg.includes("vvpat") || msg.includes("paper trail") || msg.includes("slip")) {
    return "🧾 **VVPAT (Voter Verifiable Paper Audit Trail)**\n\nWhen you vote on an EVM, the VVPAT prints a paper slip showing your chosen candidate's serial number, name, and symbol for **7 seconds**. This slip then falls into a sealed box, allowing for physical verification if needed.";
  }
  if (msg.includes("register") || msg.includes("voter id") || msg.includes("form 6")) {
    return "📋 **How to Register to Vote**\n\n1. Visit **voters.eci.gov.in** or use the **Voter Helpline App**.\n2. Fill out **Form 6** (for new voters).\n3. Keep your Aadhaar/Address proof and a photo ready.\n4. Once verified by the BLO, your name will be added to the Electoral Roll.";
  }
  if (msg.includes("nota") || msg.includes("none of the above")) {
    return "❌ **NOTA (None of the Above)**\n\nIntroduced in 2013, NOTA allows voters to officially register a 'rejection' vote if they do not support any of the candidates in their constituency. It is the last button on the EVM.";
  }
  if (msg.includes("mcc") || msg.includes("model code") || msg.includes("rules")) {
    return "📜 **Model Code of Conduct (MCC)**\n\nThese are guidelines issued by the ECI for political parties and candidates. They include:\n1. No use of religion/caste for votes.\n2. No new projects or financial grants by the government after elections are announced.\n3. Parties must inform local police about rallies and processions.";
  }
  if (msg.includes("stage") || msg.includes("timeline") || msg.includes("process")) {
    return "📅 **10 Stages of Election**\n\n1. Delimitation\n2. Electoral Rolls Update\n3. Election Announcement (MCC kicks in)\n4. Notification\n5. Nominations\n6. Scrutiny\n7. Withdrawal\n8. Campaigning\n9. Polling Day\n10. Counting & Results";
  }
  if (msg.includes("eligible") || msg.includes("age") || msg.includes("who can vote")) {
    return "🔞 **Voting Eligibility**\n\nTo vote in India, you must be:\n1. An Indian Citizen.\n2. 18 years or older as of January 1st of the election year.\n3. Registered in the electoral roll of your constituency.";
  }
  if (msg.includes("voting day") || msg.includes("polling booth") || msg.includes("documents")) {
    return "🗳️ **Voting Day Checklist**\n\n1. Find your polling booth using the Voter Helpline App.\n2. Carry your **Voter ID (EPIC)** or any approved photo ID (Aadhaar, PAN, Driving License).\n3. An indelible ink mark will be applied to your finger once you vote.";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("namaste")) {
    return "🇮🇳 **Namaste! I am VoteMitra.**\n\nI can help you with:\n1. 🗳️ EVM & VVPAT info\n2. 📋 Voter Registration (Form 6)\n3. ❌ NOTA details\n4. 🔞 Eligibility rules\n\nWhat would you like to know?";
  }
  return "🗳️ I'm **VoteMitra**, your election assistant! I can help you with Voter Registration, EVM/VVPAT info, NOTA, and more. Please ask a specific question about the Indian election process!";
}

function getFallbackQuiz() {
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

function getFallbackFlashcards() {
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

function generateSessionId() {
  return "sess_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── SPA Fallback ─────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start Server (only when run directly, not during tests) ──
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║   🗳️  VoteMitra — Election Assistant                 ║
  ║   PromptWars Challenge 2                             ║
  ║   Port: ${PORT}  |  Model: ${MODEL_NAME}  ║
  ║   AI Enabled: ${!!GEMINI_API_KEY}                                  ║
  ╚══════════════════════════════════════════════════════╝
    `);
  });
}

export { app, validateChatMessage, redactMessageForTelemetry };
