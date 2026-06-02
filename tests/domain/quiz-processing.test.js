import test from 'node:test';
import assert from 'node:assert/strict';
import { processQuizData } from '../../src/utils/utils.js';

const quiz = () => ({
  title: 'Sample quiz',
  questions: [
    {
      question: 'Q1',
      options: ['A1', 'B1', 'C1', 'D1'],
      correctAnswer: 1,
    },
    {
      question: 'Q2',
      options: ['A2', 'B2', 'C2', 'D2'],
      correctAnswer: [0, 3],
    },
    {
      question: 'Q3',
      options: ['A3', 'B3', 'C3', 'D3'],
      correctAnswer: 2,
      shuffle: 0,
    },
    {
      question: 'Q4',
      options: ['A4', 'B4'],
      correctAnswer: 0,
    },
    {
      question: 'Q5',
      options: ['A5', 'B5'],
      correctAnswer: 1,
    },
  ],
});

const settings = (overrides = {}) => ({
  shuffleQuestions: false,
  shuffleOptions: false,
  quizSize: 100,
  quizSizeMode: 'percentage',
  ...overrides,
});

function withMockedRandom(value, callback) {
  const originalRandom = Math.random;
  Math.random = () => value;
  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

test('keeps all questions in source order when no shuffling or sizing is requested', () => {
  const source = quiz();
  const processed = processQuizData(source, settings());

  assert.deepEqual(processed.questions.map((q) => q.question), ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']);
  assert.deepEqual(processed.questions.map((q) => q.originalIndex), [0, 1, 2, 3, 4]);
  assert.deepEqual(source.questions.map((q) => q.originalIndex), [undefined, undefined, undefined, undefined, undefined]);
});

test('selects the requested percentage of questions using a ceiling and at least one question', () => {
  assert.deepEqual(
    processQuizData(quiz(), settings({ quizSize: 50 })).questions.map((q) => q.question),
    ['Q1', 'Q2', 'Q3'],
  );

  assert.deepEqual(
    processQuizData(quiz(), settings({ quizSize: 10 })).questions.map((q) => q.question),
    ['Q1'],
  );
});

test('selects an exact question count when count mode is used', () => {
  assert.deepEqual(
    processQuizData(quiz(), settings({ quizSizeMode: 'count', quizSize: 2 })).questions.map((q) => q.question),
    ['Q1', 'Q2'],
  );
});

test('shuffles questions before applying quiz size so a random subset is attempted', () => {
  const processed = withMockedRandom(0, () =>
    processQuizData(quiz(), settings({ shuffleQuestions: true, quizSizeMode: 'count', quizSize: 3 })),
  );

  assert.deepEqual(processed.questions.map((q) => q.question), ['Q2', 'Q3', 'Q4']);
  assert.deepEqual(processed.questions.map((q) => q.originalIndex), [1, 2, 3]);
});

test('shuffles answer options and preserves the correct single-choice answer mapping', () => {
  const processed = withMockedRandom(0, () =>
    processQuizData(quiz(), settings({ shuffleOptions: true, quizSizeMode: 'count', quizSize: 1 })),
  );

  assert.deepEqual(processed.questions[0].options, ['B1', 'C1', 'D1', 'A1']);
  assert.equal(processed.questions[0].correctAnswer, 0);
});

test('shuffles answer options and preserves all multiple-choice answer mappings', () => {
  const processed = withMockedRandom(0, () =>
    processQuizData(quiz(), settings({ shuffleOptions: true, quizSizeMode: 'count', quizSize: 2 })),
  );

  assert.deepEqual(processed.questions[1].options, ['B2', 'C2', 'D2', 'A2']);
  assert.deepEqual(processed.questions[1].correctAnswer, [2, 3]);
});

test('respects per-question shuffle override for order-sensitive options', () => {
  const processed = withMockedRandom(0, () =>
    processQuizData(quiz(), settings({ shuffleOptions: true, quizSizeMode: 'count', quizSize: 3 })),
  );

  assert.deepEqual(processed.questions[2].options, ['A3', 'B3', 'C3', 'D3']);
  assert.equal(processed.questions[2].correctAnswer, 2);
});
