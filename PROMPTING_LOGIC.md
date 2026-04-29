# 🧠 Prompting Logic Documentation

This document explains the AI strategy and prompt engineering used for the **VoteMitra** Election Assistant. This project leverages the **Google Gemini 1.5 Flash** model with specific prompting patterns to ensure accuracy, safety, and engagement.

## 1. System Instruction Strategy

The core "brain" of the assistant is defined by a comprehensive **System Instruction** (the `SYSTEM_PROMPT()` function in `server.js`). This instruction uses a **Persona + Knowledge + Rules** framework.

### Persona Layer
- **Name**: VoteMitra (meaning "Vote Friend").
- **Tone**: Warm, encouraging, patient, and non-partisan.
- **Multilingual Support**: Explicit instruction to respond in the user's language style (English, Hindi, or Hinglish).

### Knowledge Layer
The prompt provides a detailed domain specific knowledge base including:
- **Constitutional Articles**: Articles 324-329 for legal grounding.
- **Voter Registration**: Detailed mapping of forms (6, 6A, 7, 8) and required documents.
- **EVM/VVPAT Details**: Technical facts about voting security and verification.
- **Process Stages**: The structured 10-stage journey from delimitation to results.

### Rules Layer
- **Non-Partisanship**: Mandatory neutral stance on all political parties.
- **Fact-Checking**: Encouraged citation of articles or forms.
- **Structure**: Mandatory use of bullet points and numbered lists for readability.
- **Redirection**: Instruction to gracefully redirect off-topic queries back to election education.

## 2. Constrained JSON Generation

For the **Quiz** and **Flashcard** features, we use **few-shot prompting** combined with Gemini's JSON schema output capability (`responseMimeType: "application/json"`).

### Quiz Generation Prompt
The prompt (`QUIZ_PROMPT`) provides a strict JSON schema and rules for:
- **Plausible Distractors**: Wrong options must be realistic to provide a challenge.
- **Educational Explanations**: Every question must include a 1-2 sentence explanation of the correct answer.
- **Tagging**: Each question is tagged by topic for analytical use in the frontend.

### Flashcard Generation Prompt
The prompt (`FLASHCARD_PROMPT`) focuses on defining essential terminology:
- **Concise Definitions**: Limit to 1-2 sentences for quick learning.
- **Visual Cues**: Requests a relevant emoji for each term to improve memorization.

## 3. Context & Session Management

To provide a natural conversation flow, we implement session-based memory:
- **History Tracking**: We utilize the Gemini SDK's `startChat({ history: [...] })` method.
- **Session IDs**: The backend maps specific `sessionId` strings to active chat objects in memory.
- **Persistence**: This allows users to ask follow-up questions like "What about Form 8?" after a conversation about registration.

## 4. Temperature & Sampling Settings

Different sampling parameters are used based on the task:
- **Chat**: `temperature: 0.7` — Balanced between factual accuracy and natural conversational variety.
- **Quiz/Flashcards**: `temperature: 0.8` — Slightly higher to ensure variety in generated questions across different sessions.

## 5. Security & Safety

- **Server-Side AI**: ALL prompting logic and API keys are strictly server-side.
- **API Masking**: The frontend never talks to the Gemini API directly, preventing key leakage.
- **Input Sanitization**: Messages are trimmed and validated before being passed to the model.

---
*Built as part of the Google PromptWars Challenge 2.*
