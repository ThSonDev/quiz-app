import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isMultiChoice,
  isCorrectOption,
  isOptionChosen,
  optionLabel,
  summarizeResults,
} from '../../src/utils/utils.js';

test('isMultiChoice is true only for arrays with length > 1', () => {
  assert.equal(isMultiChoice({ correctAnswer: [0, 1] }), true);
  assert.equal(isMultiChoice({ correctAnswer: [0] }), false); // single-element array
  assert.equal(isMultiChoice({ correctAnswer: 0 }), false);
});

test('isCorrectOption handles both answer shapes', () => {
  assert.equal(isCorrectOption({ correctAnswer: [0, 2] }, 2), true);
  assert.equal(isCorrectOption({ correctAnswer: [0, 2] }, 1), false);
  assert.equal(isCorrectOption({ correctAnswer: 1 }, 1), true);
  assert.equal(isCorrectOption({ correctAnswer: 1 }, 0), false);
});

test('isOptionChosen handles array, scalar, and missing answers', () => {
  assert.equal(isOptionChosen([0, 2], 2), true);
  assert.equal(isOptionChosen([0, 2], 1), false);
  assert.equal(isOptionChosen(1, 1), true);
  assert.equal(isOptionChosen(undefined, 0), false);
});

test('optionLabel maps indices to A, B, C, ...', () => {
  assert.equal(optionLabel(0), 'A');
  assert.equal(optionLabel(2), 'C');
});

test('summarizeResults buckets correct/incorrect/partial and scores out of 10', () => {
  const questions = [
    { correctAnswer: 1 }, // single, answered correctly
    { correctAnswer: 0 }, // single, answered wrong
    { correctAnswer: [0, 1] }, // multi, partial (only one of two)
  ];
  const answers = { 0: 1, 1: 2, 2: [0] };

  const summary = summarizeResults(questions, answers);

  assert.equal(summary.correctCount, 1);
  assert.equal(summary.incorrectCount, 1);
  assert.equal(summary.partialCount, 1);
  assert.equal(summary.totalQuestions, 3);
  // partial F1 = 2*1*0.5/1.5 = 0.6667; (1 + 0 + 0.6667) / 3 * 10 = 5.5556
  assert.ok(Math.abs(summary.score - 5.5556) < 0.001);
});

test('summarizeResults treats unanswered questions as incorrect', () => {
  const questions = [{ correctAnswer: 0 }, { correctAnswer: 1 }];
  const summary = summarizeResults(questions, {});
  assert.equal(summary.correctCount, 0);
  assert.equal(summary.incorrectCount, 2);
  assert.equal(summary.score, 0);
});
