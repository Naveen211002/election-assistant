import request from 'supertest';
import { createApp } from '../src/app.js';
import * as sanitizer from '../src/utils/sanitizer.js';
import * as enrichment from '../src/utils/enrichPrompt.js';

const app = createApp();

describe('VoteMitra Final Quality Audit', () => {
  
  // -- 1. INFRASTRUCTURE & SECURITY --
  describe('System Integrity', () => {
    test('Health endpoint is reachable', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });

    test('Security headers (Helmet) are active', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-frame-options']).toBe('DENY');
    });
  });

  // -- 2. CORE UTILITIES (Logic Verification) --
  describe('Core Intelligence', () => {
    test('XSS Sanitizer neutralizes scripts', () => {
      const dirty = '<script>alert(1)</script><b>Safe</b>';
      const clean = sanitizer.sanitize(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('<b>Safe</b>');
    });

    test('Intent detection recognizes EVM queries', () => {
      const result = enrichment.enrichPrompt('tell me about evm');
      expect(result.intent).toBe('voting_technology');
    });

    test('Intent detection recognizes registration queries', () => {
      const result = enrichment.enrichPrompt('how to register for form 6');
      expect(result.intent).toBe('voter_registration');
    });
  });
});
