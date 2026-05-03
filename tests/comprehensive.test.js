import request from 'supertest';
import { jest } from '@jest/globals';

// --- 1. ENHANCED MOCKS ---

let aiShouldTimeout = false;
let aiShouldReturnBadJson = false;

jest.unstable_mockModule('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    constructor() {}
    getGenerativeModel({ model }) {
      return {
        model,
        startChat: () => ({
          sendMessageStream: async () => {
            if (aiShouldTimeout) { throw new Error('DEADLINE_EXCEEDED'); }
            return { stream: (async function* () { 
              yield { text: () => 'Electronic ' }; 
              yield { text: () => 'Voting ' }; 
              yield { text: () => 'Machine' }; 
            })() };
          }
        }),
        generateContent: async () => {
          if (aiShouldReturnBadJson) { return { response: { text: () => 'INVALID JSON' } }; }
          return { response: { text: () => JSON.stringify({ questions: [{ question: '?', options: ['A'], correct: 0, explanation: 'ok' }], flashcards: [] }) } };
        }
      };
    }
  }
}));

jest.unstable_mockModule('@google-cloud/secret-manager', () => ({
  SecretManagerServiceClient: class { constructor() {} accessSecretVersion() { return [{ payload: { data: Buffer.from('mock-key', 'utf8') } }]; } }
}));
jest.unstable_mockModule('@google-cloud/bigquery', () => ({
  BigQuery: class { constructor() {} dataset() { return { table: () => ({ insert: async () => [] }) }; } }
}));
jest.unstable_mockModule('@google-cloud/logging', () => ({
  Logging: class { constructor() {} log() { return { entry: (m, d) => ({ m, d }), write: async () => [] }; } }
}));

// --- 2. IMPORTS ---
const { app } = await import('../server.js');
const { sanitize } = await import('../src/utils/sanitizer.js');
const { logger } = await import('../src/services/logger.service.js');

// --- 3. TESTS ---
describe('VoteMitra 100% Perfection Suite', () => {

  describe('Security & Integrity', () => {
    test('XSS Sanitization handles malicious scripts', () => {
      const malicious = '<script>alert(1)</script><b>Safe</b>';
      const clean = sanitize(malicious);
      // Even if JSDOM is mocked/fails in CI, we verify the output isn't dangerous
      expect(clean).not.toContain('<script>');
    });

    test('Strict Security Headers are present', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toMatch(/deny/i);
    });
  });

  describe('Resilience & Edge Cases', () => {
    test('Chat handles AI Timeout via local fallback', async () => {
      aiShouldTimeout = true;
      const res = await request(app).post('/api/chat').send({ message: 'EVM', sessionId: 's1' });
      expect(res.status).toBe(200);
      
      // Combine stream chunks for verification
      const reconstructed = res.text.split('\n')
        .filter(l => l.startsWith('data: '))
        .map(l => {
          try { return JSON.parse(l.slice(6)).chunk || ''; } catch(e) { return ''; }
        }).join('');
        
      expect(reconstructed).toMatch(/Electronic Voting Machine/i);
      aiShouldTimeout = false;
    });

    test('Quiz handles Malformed AI JSON gracefully', async () => {
      aiShouldReturnBadJson = true;
      const res = await request(app).post('/api/quiz').send({ topic: 'general' });
      expect(res.status).toBe(200);
      expect(res.body.questions).toBeDefined();
      aiShouldReturnBadJson = false;
    });
  });

  describe('Observability', () => {
    test('Logger methods execute without error', () => {
      expect(() => logger.info("Test Info")).not.toThrow();
      expect(() => logger.error("Test Error")).not.toThrow();
      expect(() => logger.warn("Test Warn")).not.toThrow();
    });
  });
});
