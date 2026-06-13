import test from 'node:test';
import assert from 'node:assert/strict';
import { parseQuizText, stripQuizExtension } from '../../src/utils/utils.js';

const validQuizJson = JSON.stringify({
  questions: [
    { question: 'Q1?', options: ['a', 'b'], correctAnswer: 0 },
    { question: 'Q2?', options: ['a', 'b', 'c'], correctAnswer: [0, 2] },
  ],
});

test('parseQuizText returns parsed data for valid quiz JSON', () => {
  const { data, error } = parseQuizText(validQuizJson);
  assert.equal(error, undefined);
  assert.equal(data.questions.length, 2);
});

test('parseQuizText reports a JSON syntax error', () => {
  const { data, error } = parseQuizText('{ not json');
  assert.equal(data, undefined);
  assert.equal(error, 'Invalid JSON file format');
});

test('parseQuizText surfaces validation errors from validateQuizData', () => {
  const { error } = parseQuizText(JSON.stringify({ questions: 'nope' }));
  assert.equal(error, 'Invalid format: missing "questions" array');
});

test('parseQuizText does not enforce the 2-question minimum (callers add that)', () => {
  const oneQuestion = JSON.stringify({ questions: [{ question: 'Q?', options: ['a', 'b'], correctAnswer: 0 }] });
  const { data, error } = parseQuizText(oneQuestion);
  assert.equal(error, undefined);
  assert.equal(data.questions.length, 1);
});

test('stripQuizExtension removes a trailing .json/.txt (case-insensitive)', () => {
  assert.equal(stripQuizExtension('quiz.json'), 'quiz');
  assert.equal(stripQuizExtension('quiz.TXT'), 'quiz');
  assert.equal(stripQuizExtension('my.quiz.json'), 'my.quiz'); // only the trailing one
  assert.equal(stripQuizExtension('quiz'), 'quiz'); // no extension
  assert.equal(stripQuizExtension('notes.md'), 'notes.md'); // unrelated extension kept
  assert.equal(stripQuizExtension(''), '');
  assert.equal(stripQuizExtension(null), '');
});
