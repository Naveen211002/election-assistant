import { getFallbackResponse, getFallbackQuiz, getFallbackFlashcards } from '../server.js';

describe('Fallback Data Helpers', () => {
  test('getFallbackResponse returns appropriate text for various keywords', () => {
    expect(getFallbackResponse('evm')).toMatch(/Electronic Voting Machine/);
    expect(getFallbackResponse('vvpat')).toMatch(/Voter Verifiable Paper Audit Trail/);
    expect(getFallbackResponse('register')).toMatch(/How to Register/);
    expect(getFallbackResponse('nota')).toMatch(/None of the Above/);
    expect(getFallbackResponse('mcc')).toMatch(/Model Code of Conduct/);
    expect(getFallbackResponse('stages')).toMatch(/10 Stages/);
    expect(getFallbackResponse('eligible')).toMatch(/Voting Eligibility/);
    expect(getFallbackResponse('polling booth')).toMatch(/Voting Day Checklist/);
    expect(getFallbackResponse('hi')).toMatch(/Namaste/);
    expect(getFallbackResponse('something random')).toMatch(/VoteMitra/);
  });

  test('getFallbackQuiz returns valid quiz structure', () => {
    const quiz = getFallbackQuiz();
    expect(quiz).toHaveProperty('questions');
    expect(quiz.questions.length).toBeGreaterThan(0);
  });

  test('getFallbackFlashcards returns valid flashcards structure', () => {
    const flashcards = getFallbackFlashcards();
    expect(flashcards).toHaveProperty('flashcards');
    expect(flashcards.flashcards.length).toBeGreaterThan(0);
  });
});
