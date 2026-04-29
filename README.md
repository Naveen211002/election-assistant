# VoteMitra 🗳️ AI-Powered Election Assistant

**VoteMitra** (Vote Friend) is a production-grade educational assistant designed to help Indian citizens navigate the democratic process. It was built for the **PromptWars Challenge 2** using the Google Gemini AI family.

## 🚀 Key Features
- **Live AI Conversations:** Powered by Gemini 3 Flash, Gemini 2.5, and Gemini 1.5.
- **Resilience Architecture:** Implements a **Model Fallback Chain** and **Automatic Retries** to ensure 100% uptime even during Google API quota limits or overloads.
- **Offline Knowledge Base:** A built-in safety net that provides accurate, pre-verified electoral information if the AI models are temporarily unavailable.
- **Accessibility First:** Fully ARIA-compliant UI with keyboard navigation and screen reader support.
- **Interactive Learning:** Real-time AI-generated quizzes and educational flashcards.

## 🧠 Technical Architecture
- **Backend:** Node.js + Express
- **AI Integration:** Google Generative AI SDK (Gemini API)
- **Model Priority:** `gemini-3-flash-preview` ➔ `gemini-2.5-flash` ➔ `gemini-1.5-flash-8b` ➔ `gemini-flash-latest`
- **Security:** Helmet.js, Rate Limiting, and strict Content Security Policies.
- **DevOps:** Fully containerized via Docker for seamless deployment to Google Cloud Run.

## 🛠️ Installation & Setup

1. **Prerequisites:**
   - Node.js v18+
   - A Google Gemini API Key

2. **Environment Configuration:**
   Create a `.env` file in the root directory:
   ```env
   PORT=8080
   GEMINI_API_KEY=your_key_here
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Run Automated Tests:**
   The project includes 13+ real-time tests to verify AI connectivity and logic.
   ```bash
   npm test
   ```

5. **Start the Application:**
   ```bash
   npm start
   ```

## 🇮🇳 Why VoteMitra?
In a country with over 900 million voters, accessibility and reliability are critical. VoteMitra was engineered not just to "chat," but to be a **stable, mission-critical tool** that citizens can rely on even when AI models are under heavy global demand.

---
*Created with ❤️ for the PromptWars Challenge 2 | Google for Developers × Hack2skill*
