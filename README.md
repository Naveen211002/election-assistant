# VoteMitra - AI Election Assistant

VoteMitra is a smart and resilient educational assistant for Indian election awareness.  
It is built for PromptWars Challenge 2 to help first-time and regular voters understand the election process in a simple, safe, and multilingual way.

## Chosen Vertical
- **Civic and voter education assistant** for the Indian election process.

## Approach and Logic
- Uses Gemini models to answer election questions with a strict, non-partisan system prompt.
- Applies a **model fallback chain** and **retry strategy** to keep responses reliable during API overload or quota issues.
- Provides **local safety fallbacks** (verified static responses, quiz, flashcards) when AI is unavailable.
- Supports session-based chat context for better continuity.
- Enforces input validation and response constraints to avoid low-quality or unsafe interactions.

## Google Services Integration
- **Gemini API** (`@google/generative-ai`) for chat, quiz generation, and flashcards.
- **Cloud Run structured logging** via JSON logs for request and error telemetry.
- **BigQuery telemetry (optional)** (`@google-cloud/bigquery`) to store structured product analytics events (`chat_success`, `quiz_success`, `flashcards_success`, fallbacks).
- Designed for **Google Cloud Run** deployment with container support.

## Security and Reliability
- `helmet` with content security policy headers.
- Rate limiting on `/api/*` routes to reduce abuse.
- Request size limits and message validation.
- Retry with exponential backoff for transient model failures.
- Graceful fallback behavior when AI is unavailable.

## Accessibility and Usability
- Simple educational UX with quiz and flashcards.
- ARIA-friendly frontend structure (in `public/`).
- Language-adaptive assistant behavior (English, Hindi, Hinglish style support).

## Tech Stack
- Node.js + Express
- Google Gemini SDK
- Google Cloud Logging + BigQuery (optional analytics)
- Jest + Supertest
- Docker (Cloud Run ready)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example`:
   ```env
   PORT=8080
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_CLOUD_PROJECT=your_project_id
   BIGQUERY_DATASET=votemitra_analytics
   BIGQUERY_TABLE=events
   ```
3. Run quality checks:
   ```bash
   npm run lint
   npm test
   ```
4. Start app:
   ```bash
   npm start
   ```

## API Endpoints
- `GET /api/health` - service status and AI availability
- `GET /api/ready` - runtime readiness checks
- `POST /api/chat` - contextual election assistant
- `POST /api/quiz` - AI-generated quiz JSON
- `POST /api/flashcards` - AI-generated flashcards JSON

## Assumptions
- Users ask election education questions, not political campaign support.
- Gemini API key is valid and has model access.
- Optional BigQuery dataset/table already exists when telemetry is enabled.

## Testing
- Unit tests for input validation and telemetry sanitization.
- Integration tests for health, chat, quiz, and flashcard endpoints.
- Fallback-aware tests to handle quota/rate variability in AI services.

## Submission Artifacts
- `SUBMISSION_CHECKLIST.md` - final pre-submit quality gate checklist.
- `API_CONTRACT.md` - request/response schema reference.
- `BIGQUERY_SETUP.md` - optional BigQuery setup and verification SQL.

## Active Model Priority
`gemini-3-flash-preview` -> `gemini-2.5-flash` -> `gemini-2.0-flash` -> `gemini-flash-latest`
