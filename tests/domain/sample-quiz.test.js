import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQuizData, processQuizData } from '../../src/utils/utils.js';
import { sampleQuizData, sampleQuizEntry } from '../../src/utils/sampleQuiz.js';

test('sample quiz passes validation', () => {
  assert.equal(validateQuizData(sampleQuizData), null);
});

test('sample quiz has 10 questions and exercises the format features', () => {
  const qs = sampleQuizData.questions;
  assert.equal(qs.length, 10);
  // a real multiple-choice question (array length > 1)
  assert.ok(qs.some((q) => Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1), 'has multi-choice');
  // a single-choice question (plain number)
  assert.ok(qs.some((q) => typeof q.correctAnswer === 'number'), 'has single-choice');
  // the single-element-array edge case (still single choice)
  assert.ok(qs.some((q) => Array.isArray(q.correctAnswer) && q.correctAnswer.length === 1), 'has single-element array');
  // a per-question shuffle override
  assert.ok(qs.some((q) => q.shuffle === 0), 'has a shuffle:0 override');
  // an omitted (optional) explanation
  assert.ok(qs.some((q) => q.explanation === undefined), 'has a question without an explanation');
  // a two-option (minimum) question
  assert.ok(qs.some((q) => q.options.length === 2), 'has a two-option question');
});

test('sample quiz entry is content-addressed and flagged as the built-in sample', () => {
  assert.equal(sampleQuizEntry.questionCount, 10);
  assert.equal(sampleQuizEntry.isSample, true);
  assert.equal(sampleQuizEntry.bookmarked, false);
  assert.equal(typeof sampleQuizEntry.id, 'string');
  assert.equal(sampleQuizEntry.rawData, sampleQuizData);
});

test('processing the sample quiz preserves single/multi answer shapes', () => {
  const processed = processQuizData(sampleQuizData, {
    shuffleQuestions: true,
    shuffleOptions: true,
    quizSize: 100,
    quizSizeMode: 'percentage',
  });
  assert.equal(processed.questions.length, 10);
  for (const q of processed.questions) {
    if (Array.isArray(q.correctAnswer)) {
      const sorted = [...q.correctAnswer].sort((a, b) => a - b);
      assert.deepEqual(q.correctAnswer, sorted, 'multi answers stay sorted after remap');
    } else {
      assert.equal(typeof q.correctAnswer, 'number', 'single answers stay numbers');
    }
  }
});
