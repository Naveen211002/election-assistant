import request from 'supertest';
import { jest } from '@jest/globals';

// Mock the Gemini API
jest.unstable_mockModule('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    constructor() {}
    getGenerativeModel() {
      return {
        startChat: () => ({
          sendMessage: async () => ({
            response: { text: () => 'Mocked AI reply' }
          })
        }),
        generateContent: async () => ({
          response: { text: () => JSON.stringify({ questions: [], flashcards: [] }) }
        })
      };
    }
  }
}));

const { app } = await import('../server.js');

describe('Election Assistant API', () => {
  test('POST /api/chat with valid message returns 200', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'How do I register to vote?', sessionId: 'test-session' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply');
  });

  test('POST /api/chat with empty message returns 400', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: '', sessionId: 'test-session' });
    
    expect(res.status).toBe(400);
  });

  test('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('POST /api/chat with message longer than 2000 characters returns 400', async () => {
    const longMessage = 'a'.repeat(2001);
    const res = await request(app)
      .post('/api/chat')
      .send({ message: longMessage, sessionId: 'test-session' });
    
    expect(res.status).toBe(400);
  });

  test('POST /api/quiz returns 200', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .send({ difficulty: 'easy', topic: 'general' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('questions');
  });

  test('POST /api/flashcards returns 200', async () => {
    const res = await request(app)
      .post('/api/flashcards')
      .send({ topic: 'general' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('flashcards');
  });

  test('GET /api/ready returns 200', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.status).toBe(200);
  });

  test('GET random route returns index.html (SPA Fallback)', async () => {
    const res = await request(app).get('/some-random-route');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<!DOCTYPE html>');
  });
});
