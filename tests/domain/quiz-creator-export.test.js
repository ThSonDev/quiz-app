import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuizPayload, emptyQuestion, quizToCreatorQuestions } from '../../src/utils/quizCreator.js';
import { validateQuizData } from '../../src/utils/utils.js';

const singleQuestion = (overrides = {}) => ({
  question: '  What is 2 + 2?  ',
  type: 'single',
  options: [
    { text: '  3  ', isCorrect: false },
    { text: '  4  ', isCorrect: true },
  ],
  explanation: '  Basic arithmetic.  ',
  noShuffleOptions: false,
  ...overrides,
});

const multiQuestion = (overrides = {}) => ({
  question: 'Which are JavaScript runtimes?',
  type: 'multi',
  options: [
    { text: 'Node.js', isCorrect: true },
    { text: 'Django', isCorrect: false },
    { text: 'Deno', isCorrect: true },
  ],
  explanation: '',
  noShuffleOptions: true,
  ...overrides,
});

test('starts new creator questions in a blank single-choice state with two options', () => {
  assert.deepEqual(emptyQuestion(), {
    question: '',
    type: 'single',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    explanation: '',
    noShuffleOptions: false,
  });
});

test('exports creator questions to the same JSON contract accepted by uploads', () => {
  const result = buildQuizPayload([singleQuestion(), multiQuestion()]);

  assert.deepEqual(result, {
    data: {
      questions: [
        {
          question: 'What is 2 + 2?',
          options: ['3', '4'],
          correctAnswer: 1,
          explanation: 'Basic arithmetic.',
        },
        {
          question: 'Which are JavaScript runtimes?',
          options: ['Node.js', 'Django', 'Deno'],
          correctAnswer: [0, 2],
          shuffle: 0,
        },
      ],
    },
  });
  assert.equal(validateQuizData(result.data), null);
});

test('requires at least two questions before exporting a quiz', () => {
  assert.equal(
    buildQuizPayload([singleQuestion()]).error,
    'A quiz must contain at least 2 questions',
  );
});

test('rejects incomplete creator questions before download', () => {
  const cases = [
    [singleQuestion({ question: '   ' }), 'Question 1 is missing its text'],
    [singleQuestion({ options: [{ text: 'A', isCorrect: true }, { text: ' ', isCorrect: false }] }), 'Question 1 has an empty option'],
    [singleQuestion({ options: [{ text: 'A', isCorrect: false }] }), 'Question 1 needs at least 2 options'],
    [singleQuestion({ options: [{ text: 'A', isCorrect: false }, { text: 'B', isCorrect: false }] }), 'Question 1 needs at least one correct answer'],
    [multiQuestion({ options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }] }), 'Question 1 is set to Multiple Choice but only has 1 correct answer'],
  ];

  for (const [question, error] of cases) {
    assert.equal(buildQuizPayload([question, singleQuestion()]).error, error);
  }
});

test('imports an uploaded quiz into the creator shape, inferring type and shuffle flags', () => {
  const uploaded = {
    questions: [
      {
        question: 'What is 2 + 2?',
        options: ['3', '4'],
        correctAnswer: 1,
        explanation: 'Basic arithmetic.',
      },
      {
        question: 'Which are JavaScript runtimes?',
        options: ['Node.js', 'Django', 'Deno'],
        correctAnswer: [0, 2],
        shuffle: 0,
      },
    ],
  };

  assert.deepEqual(quizToCreatorQuestions(uploaded), [
    {
      question: 'What is 2 + 2?',
      type: 'single',
      options: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
      ],
      explanation: 'Basic arithmetic.',
      noShuffleOptions: false,
    },
    {
      question: 'Which are JavaScript runtimes?',
      type: 'multi',
      options: [
        { text: 'Node.js', isCorrect: true },
        { text: 'Django', isCorrect: false },
        { text: 'Deno', isCorrect: true },
      ],
      explanation: '',
      noShuffleOptions: true,
    },
  ]);
});

test('treats a one-item correctAnswer array as single choice on import', () => {
  const imported = quizToCreatorQuestions({
    questions: [{ question: 'Pick one', options: ['A', 'B'], correctAnswer: [1] }],
  });

  assert.equal(imported[0].type, 'single');
  assert.deepEqual(imported[0].options.map((o) => o.isCorrect), [false, true]);
});

test('round-trips a built quiz back through import without losing data', () => {
  const built = buildQuizPayload([singleQuestion(), multiQuestion()]).data;
  const reimported = quizToCreatorQuestions(built);

  assert.deepEqual(buildQuizPayload(reimported).data, built);
});

test('uses the first selected answer when a single-choice creator question has multiple marked options', () => {
  const result = buildQuizPayload([
    singleQuestion({
      options: [
        { text: 'A', isCorrect: true },
        { text: 'B', isCorrect: true },
      ],
    }),
    multiQuestion(),
  ]);

  assert.equal(result.data.questions[0].correctAnswer, 0);
});
