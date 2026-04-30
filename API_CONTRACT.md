# API Contract

Base URL: `http://localhost:8080`

## GET `/api/health`
Returns service metadata.

Response:
```json
{
  "status": "healthy",
  "service": "VoteMitra Election Assistant",
  "model": "gemini-3-flash-preview",
  "aiEnabled": true,
  "timestamp": "2026-04-30T00:00:00.000Z"
}
```

## GET `/api/ready`
Returns readiness checks for runtime dependencies.

Response:
```json
{
  "status": "ready",
  "checks": {
    "webServer": true,
    "aiConfigured": true,
    "bigQueryConfigured": false
  },
  "timestamp": "2026-04-30T00:00:00.000Z"
}
```

## POST `/api/chat`
Educational conversation endpoint.

Request:
```json
{
  "message": "How do I register as a voter?",
  "sessionId": "optional_previous_session_id"
}
```

Response:
```json
{
  "reply": "Generated educational answer...",
  "sessionId": "sess_abc123",
  "source": "gemini"
}
```

Validation:
- `message` must be a non-empty string.
- `message` max length: 1200 characters.

## POST `/api/quiz`
Generates 5 multiple-choice questions.

Request:
```json
{
  "difficulty": "easy",
  "topic": "voter-id"
}
```

Response:
```json
{
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Reason",
      "topic": "topic-tag"
    }
  ]
}
```

## POST `/api/flashcards`
Generates 8 educational flashcards.

Request:
```json
{
  "topic": "EVM"
}
```

Response:
```json
{
  "flashcards": [
    {
      "id": 1,
      "term": "EVM",
      "definition": "Electronic Voting Machine...",
      "emoji": "🗳️",
      "category": "technology"
    }
  ]
}
```
