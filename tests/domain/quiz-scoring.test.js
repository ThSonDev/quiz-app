import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuestionScore } from '../../src/utils/utils.js';

test('scores unanswered questions as zero', () => {
  const question = { correctAnswer: 1 };

  assert.equal(calculateQuestionScore(question, undefined), 0);
  assert.equal(calculateQuestionScore(question, null), 0);
});

test('scores single-choice answers as all-or-nothing', () => {
  const question = { correctAnswer: 1 };

  assert.equal(calculateQuestionScore(question, 1), 1);
  assert.equal(calculateQuestionScore(question, 0), 0);
});

test('treats a one-item correctAnswer array as a single-choice question', () => {
  const question = { correctAnswer: [2] };

  assert.equal(calculateQuestionScore(question, 2), 1);
  assert.equal(calculateQuestionScore(question, [2]), 1);
  assert.equal(calculateQuestionScore(question, 1), 0);
});

test('awards full credit for selecting exactly all correct multiple-choice answers', () => {
  const question = { correctAnswer: [0, 2, 4] };

  assert.equal(calculateQuestionScore(question, [0, 2, 4]), 1);
});

test('awards zero for empty or entirely wrong multiple-choice selections', () => {
  const question = { correctAnswer: [0, 2, 4] };

  assert.equal(calculateQuestionScore(question, []), 0);
  assert.equal(calculateQuestionScore(question, [1, 3]), 0);
});

test('awards partial multiple-choice credit using F1 precision and recall', () => {
  const question = { correctAnswer: [0, 2, 4] };

  assert.equal(calculateQuestionScore(question, [0, 1]), 0.4);
  assert.equal(calculateQuestionScore(question, [0, 2, 4, 1]), 0.8571428571428571);
});

test('does not let duplicate selected answers inflate multiple-choice score', () => {
  const question = { correctAnswer: [0, 1] };

  assert.equal(calculateQuestionScore(question, [0, 0]), 2 / 3);
});
