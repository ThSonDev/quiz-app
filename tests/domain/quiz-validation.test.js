import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQuizData } from '../../src/utils/utils.js';

const validQuiz = () => ({
  questions: [
    {
      question: 'What is the capital of France?',
      options: ['London', 'Paris', 'Berlin'],
      correctAnswer: 1,
      explanation: 'Paris is the capital of France.',
    },
    {
      question: 'Which are JavaScript runtimes?',
      options: ['Node.js', 'Django', 'Deno', 'Rails'],
      correctAnswer: [0, 2],
      shuffle: 0,
    },
  ],
});

test('accepts a valid quiz containing single-choice and multiple-choice questions', () => {
  assert.equal(validateQuizData(validQuiz()), null);
});

test('requires a top-level questions array', () => {
  assert.equal(validateQuizData({}), 'Invalid format: missing "questions" array');
  assert.equal(validateQuizData({ questions: 'not-an-array' }), 'Invalid format: missing "questions" array');
});

test('requires each question to include non-empty text, options, and correctAnswer', () => {
  const cases = [
    { question: '', options: ['A', 'B'], correctAnswer: 0 },
    { question: '   ', options: ['A', 'B'], correctAnswer: 0 },
    { options: ['A', 'B'], correctAnswer: 0 },
    { question: 'Missing options', correctAnswer: 0 },
    { question: 'Missing answer', options: ['A', 'B'] },
  ];

  for (const question of cases) {
    assert.equal(
      validateQuizData({ questions: [question] }),
      'Invalid question format at index 0',
    );
  }
});

test('requires at least two non-empty string options per question', () => {
  assert.equal(
    validateQuizData({ questions: [{ question: 'Only one?', options: ['A'], correctAnswer: 0 }] }),
    'Question 0 must have at least 2 options',
  );

  for (const options of [['A', ''], ['A', '   '], ['A', 2]]) {
    assert.equal(
      validateQuizData({ questions: [{ question: 'Bad option?', options, correctAnswer: 0 }] }),
      'Question 0 has an invalid option',
    );
  }
});

test('requires single-choice correctAnswer to be an integer option index', () => {
  const invalidAnswers = [-1, 2, 1.5, '1', Number.NaN, Number.POSITIVE_INFINITY];

  for (const correctAnswer of invalidAnswers) {
    assert.equal(
      validateQuizData({ questions: [{ question: 'Pick one', options: ['A', 'B'], correctAnswer }] }),
      'Invalid correctAnswer index for question 0',
    );
  }
});

test('requires multiple-choice correctAnswer to contain unique integer option indices', () => {
  assert.equal(
    validateQuizData({ questions: [{ question: 'Pick many', options: ['A', 'B'], correctAnswer: [] }] }),
    'Question 0 must have at least one correct answer',
  );

  assert.equal(
    validateQuizData({ questions: [{ question: 'Pick many', options: ['A', 'B'], correctAnswer: [0, 2] }] }),
    'Invalid index 2 in correctAnswer for question 0',
  );

  assert.equal(
    validateQuizData({ questions: [{ question: 'Pick many', options: ['A', 'B'], correctAnswer: [0, '1'] }] }),
    'Invalid index 1 in correctAnswer for question 0',
  );

  assert.equal(
    validateQuizData({ questions: [{ question: 'Pick many', options: ['A', 'B'], correctAnswer: [0, 0] }] }),
    'Duplicate index 0 in correctAnswer for question 0',
  );
});

test('accepts a one-item correctAnswer array because it behaves as single choice', () => {
  assert.equal(
    validateQuizData({ questions: [{ question: 'Pick one', options: ['A', 'B'], correctAnswer: [1] }] }),
    null,
  );
});
