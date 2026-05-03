# VoteMitra - AI Election Education Assistant

VoteMitra is an interactive, step-by-step educational tool designed to help voters understand the Indian election process, voter registration requirements, and key timelines.

## Features
- **AI Chat Assistant**: Get instant answers to complex election queries.
- **Journey Map**: Visual guide through the 10 stages of the election process.
- **Interactive Quiz**: Test your knowledge of election rules and constitutional provisions.
- **Learning Flashcards**: Quick reference for election terminology (EVM, VVPAT, NOTA, etc.).

## How It Works
1. **User Interaction**: Users can ask questions or interact with educational modules.
2. **Context Enrichment**: The system analyzes queries to provide relevant ECI guidelines and constitutional context.
3. **Multi-Model Intelligence**: Leverages the Google Gemini API with a resilient fallback mechanism for high availability.
4. **Analytics**: Interaction telemetry is logged for product improvement.

## Technical Stack
- **Backend**: Node.js, Express.js (ES Modules)
- **AI Engine**: Google Gemini API (Generative AI & Vertex AI)
- **Database/Analytics**: Google BigQuery
- **Testing**: Jest, Supertest
- **Deployment**: Docker, Google Cloud Run

## Challenge Documentation

### Your chosen vertical
**Vertical 1: Election Process Education Assistant**. We chose this vertical to solve the real-world problem of voter confusion by providing an interactive, gamified, and highly accessible guide to the Indian democratic process.

### Approach and logic
Our approach leverages a modular Node.js backend acting as a secure middleware between the user and the Google Gemini API. We use a **Multi-Model Fallback Chain** to ensure high availability, gracefully degrading to local cache or fallback static data if the API experiences rate limits. Logic is separated cleanly into controllers, services, and utilities to maximize maintainability.

### How the solution works
1. **User Interaction**: Users ask questions or select modules (Quiz/Flashcards) via the vanilla JS frontend.
2. **Context Enrichment**: The `enrichPrompt` utility analyzes the user's intent to inject specific context (e.g., voter registration rules) into the Gemini prompt.
3. **AI Generation**: Gemini dynamically generates JSON payloads for quizzes or streams Markdown text for chat.
4. **Sanitization**: Responses are sanitized via DOMPurify before reaching the client to prevent XSS.

### Any assumptions made
- We assume the user has a basic modern browser capable of SSE (Server-Sent Events) for the chat stream.
- We assume the Gemini API keys are safely stored in Google Cloud Secret Manager for production.
- We assume the target audience understands basic English, as multi-language support is planned for V2.

## Project Structure
```text
.
├── src/
│   ├── config/         # App configuration & environment vars
│   ├── controllers/    # Route handlers (logic separation)
│   ├── routes/         # Express route definitions
│   ├── services/       # External integrations (Gemini, BigQuery, Logger)
│   └── utils/          # Shared helper functions & education logic
├── public/             # Frontend assets (HTML, CSS, JS)
├── tests/              # Jest test suites
├── scripts/            # Development & maintenance scripts
└── server.js           # Application entry point
```

## Quality Standards
- **Clean Code**: Follows ESLint `eslint:recommended` rules.
- **Maintainability**: Documented with JSDoc; modular architecture.
- **Resilience**: 100% test pass rate with coverage; multi-model AI fallback.
- **Security**: Hardened with Helmet.js CSP and input sanitization.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Google Cloud Project with Gemini API access

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Naveen230497/election-assistant.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key
   GCP_PROJECT_ID=your_project_id
   ```

### Running Locally
```bash
npm start
```

### Running Tests
```bash
npm test
```

## Deployment
This project is configured for one-click deployment to Google Cloud Run using the included `Dockerfile`.

---
*Note: This is an educational tool and is not an official application of the Election Commission of India.*
