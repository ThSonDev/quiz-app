import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashQuiz,
  upsertQuiz,
  removeQuiz,
  replaceQuiz,
  toggleBookmark,
  sortLibrary,
} from '../../src/utils/storage.js';

const quiz = (questions) => ({ questions });

const sample = () =>
  quiz([
    { question: 'Q1', options: ['A', 'B'], correctAnswer: 0 },
    { question: 'Q2', options: ['A', 'B'], correctAnswer: 1 },
  ]);

test('hashes identical quiz content to the same id and different content to different ids', () => {
  assert.equal(hashQuiz(sample()), hashQuiz(sample()));

  const other = quiz([
    { question: 'Q1', options: ['A', 'B'], correctAnswer: 0 },
    { question: 'Q2 changed', options: ['A', 'B'], correctAnswer: 1 },
  ]);
  assert.notEqual(hashQuiz(sample()), hashQuiz(other));
});

test('adds a new quiz entry with content id, name, count, time, and default bookmark', () => {
  const entries = upsertQuiz([], { rawData: sample(), name: 'first.json' }, 1000);

  assert.equal(entries.length, 1);
  assert.deepEqual(
    { ...entries[0], rawData: undefined },
    {
      id: hashQuiz(sample()),
      name: 'first.json',
      questionCount: 2,
      uploadedAt: 1000,
      bookmarked: false,
      rawData: undefined,
    },
  );
});

test('re-uploading identical content bumps the existing entry instead of duplicating', () => {
  const first = upsertQuiz([], { rawData: sample(), name: 'first.json' }, 1000);
  const second = upsertQuiz(first, { rawData: sample(), name: 'renamed.json' }, 2000);

  assert.equal(second.length, 1);
  assert.equal(second[0].name, 'renamed.json');
  assert.equal(second[0].uploadedAt, 2000);
});

test('keeps quizzes that share a name and count but differ in content as separate entries', () => {
  const a = quiz([
    { question: 'A1', options: ['x', 'y'], correctAnswer: 0 },
    { question: 'A2', options: ['x', 'y'], correctAnswer: 0 },
  ]);
  const b = quiz([
    { question: 'B1', options: ['x', 'y'], correctAnswer: 1 },
    { question: 'B2', options: ['x', 'y'], correctAnswer: 1 },
  ]);

  let entries = upsertQuiz([], { rawData: a, name: 'quiz.json' }, 1000);
  entries = upsertQuiz(entries, { rawData: b, name: 'quiz.json' }, 2000);

  assert.equal(entries.length, 2);
});

test('removes a quiz by id', () => {
  const entries = upsertQuiz([], { rawData: sample(), name: 'first.json' }, 1000);
  assert.deepEqual(removeQuiz(entries, entries[0].id), []);
  assert.deepEqual(removeQuiz(entries, 'missing'), entries);
});

test('replaces an edited quiz: new content gets a new id, time is bumped, bookmark carried over', () => {
  let entries = upsertQuiz([], { rawData: sample(), name: 'first.json' }, 1000);
  const oldId = entries[0].id;
  entries = toggleBookmark(entries, oldId);

  const edited = quiz([
    { question: 'Q1 edited', options: ['A', 'B'], correctAnswer: 0 },
    { question: 'Q2', options: ['A', 'B'], correctAnswer: 1 },
  ]);
  const result = replaceQuiz(entries, oldId, { rawData: edited, name: 'first' }, true, 5000);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, hashQuiz(edited));
  assert.notEqual(result[0].id, oldId);
  assert.equal(result[0].uploadedAt, 5000);
  assert.equal(result[0].bookmarked, true);
});

test('replacing a quiz with unchanged content keeps a single entry and bumps its time', () => {
  const entries = upsertQuiz([], { rawData: sample(), name: 'first.json' }, 1000);
  const result = replaceQuiz(entries, entries[0].id, { rawData: sample(), name: 'first' }, false, 5000);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, entries[0].id);
  assert.equal(result[0].uploadedAt, 5000);
});

test('toggles the bookmark flag for the matching entry only', () => {
  let entries = upsertQuiz([], { rawData: sample(), name: 'first.json' }, 1000);
  const id = entries[0].id;

  entries = toggleBookmark(entries, id);
  assert.equal(entries[0].bookmarked, true);

  entries = toggleBookmark(entries, id);
  assert.equal(entries[0].bookmarked, false);
});

test('sorts bookmarked entries first, then by most recent upload', () => {
  const entries = [
    { id: 'a', name: 'a', uploadedAt: 1000, bookmarked: false },
    { id: 'b', name: 'b', uploadedAt: 3000, bookmarked: false },
    { id: 'c', name: 'c', uploadedAt: 2000, bookmarked: true },
  ];

  assert.deepEqual(sortLibrary(entries).map((e) => e.id), ['c', 'b', 'a']);
});
