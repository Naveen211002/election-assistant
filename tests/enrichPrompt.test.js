import { enrichPrompt } from '../enrichPrompt.js';

describe('Enrich Prompt Module', () => {
  test('detects voter_registration intent', () => {
    const { intent } = enrichPrompt('How to register?');
    expect(intent).toBe('voter_registration');
  });

  test('detects deadlines intent', () => {
    const { intent } = enrichPrompt('When is the deadline?');
    expect(intent).toBe('deadlines');
  });

  test('detects candidates intent', () => {
    const { intent } = enrichPrompt('Who are the candidates?');
    expect(intent).toBe('candidates');
  });

  test('detects polling_location intent', () => {
    const { intent } = enrichPrompt('Where is my poll booth?');
    expect(intent).toBe('polling_location');
  });

  test('defaults to general intent', () => {
    const { intent } = enrichPrompt('Tell me about elections');
    expect(intent).toBe('general');
  });
});
