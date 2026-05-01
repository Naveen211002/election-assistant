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
- **Backend**: Node.js, Express.js
- **AI Engine**: Google Gemini API
- **Database/Analytics**: Google BigQuery
- **Testing**: Jest, Supertest
- **Deployment**: Docker, Google Cloud Run

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
