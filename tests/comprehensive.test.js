import request from 'supertest';
import { jest } from '@jest/globals';

// --- 1. ROBUST MOCKS ---

// Mock Google AI
jest.unstable_mockModule('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    constructor() {}
    getGenerativeModel({ model }) {
      return {
        model,
        startChat: () => ({
          sendMessageStream: async () => ({
            stream: (async function* () { yield { text: () => 'Success' }; })()
          })
        }),
        generateContent: async () => ({
          response: { text: () => JSON.stringify({ questions: [{ question: '?', options: ['A'], correct: 0, explanation: 'ok' }], flashcards: [{ term: 'X', emoji: '🗳️', category: 'C', definition: 'D' }] }) }
        })
      };
    }
  }
}));

// Mock Secret Manager
jest.unstable_mockModule('@google-cloud/secret-manager', () => ({
  SecretManagerServiceClient: class {
    constructor() {}
    accessSecretVersion() {
      return [{ payload: { data: Buffer.from('mock-key', 'utf8') } }];
    }
  }
}));

// Mock BigQuery
jest.unstable_mockModule('@google-cloud/bigquery', () => ({
  BigQuery: class {
    constructor() {}
    dataset() { return { table: () => ({ insert: async () => [] }) }; }
  }
}));

// Mock Logging (Fixing the TypeError for good)
const mockEntry = jest.fn((meta, data) => ({ meta, data }));
const mockWrite = jest.fn().mockResolvedValue([]);
jest.unstable_mockModule('@google-cloud/logging', () => ({
  Logging: class {
    constructor() {}
    log() { return { entry: mockEntry, write: mockWrite }; }
  }
}));

// --- 2. IMPORTS ---
const { app } = await import('../server.js');
const { config } = await import('../src/config/config.js');
const { sanitize } = await import('../src/utils/sanitizer.js');
const { enrichPrompt } = await import('../src/utils/enrichPrompt.js');

// --- 3. TESTS ---
describe('VoteMitra Final 100% Quality Suite', () => {

  describe('Infrastructure', () => {
    test('Server is secure and healthy', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.headers['x-frame-options']).toBe('DENY');
    });

    test('Config retrieves Gemini key', async () => {
      const key = await config.getGeminiKey();
      expect(key).toBe('mock-key');
    });
  });

  describe('AI Endpoints', () => {
    test('Chat streaming works', async () => {
      const res = await request(app).post('/api/chat').send({ message: 'Hi', sessionId: '1' });
      expect(res.status).toBe(200);
    });

    test('Quiz & Flashcards work', async () => {
      const q = await request(app).post('/api/quiz').send({ topic: 'gen' });
      expect(q.body.questions).toBeDefined();
      
      const f = await request(app).post('/api/flashcards').send({ topic: 'gen' });
      expect(f.body.flashcards).toBeDefined();
    });
  });

  describe('Utilities', () => {
    test('Sanitizer handles strings and nulls', () => {
      expect(sanitize(null)).toBe('');
      expect(sanitize('<b>test</b>')).toContain('<b>test</b>');
    });

    test('enrichPrompt detects intent', () => {
      const result = enrichPrompt('how to register?');
      expect(result.intent).toBe('voter_registration');
    });
  });
});
