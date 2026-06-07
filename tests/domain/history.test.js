import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAttempt,
  appendAttempt,
  getAttempts,
  hasHistory,
  attemptDelta,
  degradeAttempts,
  migrateHistoryForEdit,
  loadHistory,
  saveHistory,
  recordAttempt,
} from '../../src/utils/history.js';

const processed = (questions) => ({ questions });

// A 2-question single-choice quiz the user got half right (1/2 → 5.0/10).
const sampleRun = () => ({
  processedQuizData: processed([
    { question: 'Q1', options: ['A', 'B'], correctAnswer: 0 },
    { question: 'Q2', options: ['A', 'B'], correctAnswer: 1 },
  ]),
  answers: { 0: 0, 1: 0 },
  settings: { shuffleQuestions: false, shuffleOptions: false, quizSize: 100, quizSizeMode: 'percentage' },
});

// --- buildAttempt -----------------------------------------------------------

test('buildAttempt summarizes the run and keeps the layout/answers/settings', () => {
  const run = sampleRun();
  const a = buildAttempt(run, 1000);
  assert.equal(a.takenAt, 1000);
  assert.equal(a.score, 5);
  assert.equal(a.correctCount, 1);
  assert.equal(a.incorrectCount, 1);
  assert.equal(a.partialCount, 0);
  assert.equal(a.totalQuestions, 2);
  assert.equal(a.reviewable, true);
  assert.deepEqual(a.settings, run.settings);
  assert.deepEqual(a.processedQuizData, run.processedQuizData);
  assert.deepEqual(a.answers, run.answers);
  assert.equal(typeof a.attemptId, 'string');
});

// --- appendAttempt / getAttempts / hasHistory -------------------------------

test('appendAttempt adds to the quiz list without mutating the input map', () => {
  const map = {};
  const a1 = buildAttempt(sampleRun(), 1);
  const next = appendAttempt(map, 'quiz-a', a1);
  assert.deepEqual(map, {}, 'original map untouched');
  assert.deepEqual(getAttempts(next, 'quiz-a'), [a1]);

  const a2 = buildAttempt(sampleRun(), 2);
  const next2 = appendAttempt(next, 'quiz-a', a2);
  assert.deepEqual(getAttempts(next2, 'quiz-a'), [a1, a2], 'appended oldest-first');
});

test('getAttempts returns an empty array for an unknown quiz', () => {
  assert.deepEqual(getAttempts({}, 'nope'), []);
});

test('hasHistory reflects whether a quiz has any attempts', () => {
  const map = appendAttempt({}, 'q', buildAttempt(sampleRun(), 1));
  assert.equal(hasHistory(map, 'q'), true);
  assert.equal(hasHistory(map, 'other'), false);
});

// --- attemptDelta -----------------------------------------------------------

test('attemptDelta is null for the first attempt and the score gap vs the previous same-size attempt', () => {
  const attempts = [
    { score: 5, totalQuestions: 10 },
    { score: 7.5, totalQuestions: 10 },
    { score: 6, totalQuestions: 10 },
  ];
  assert.equal(attemptDelta(attempts, 0), null);
  assert.equal(attemptDelta(attempts, 1), 2.5);
  assert.equal(attemptDelta(attempts, 2), -1.5);
  assert.equal(attemptDelta(attempts, 9), null, 'out of range → null');
});

test('attemptDelta only compares attempts of the same size (totalQuestions)', () => {
  const attempts = [
    { score: 4, totalQuestions: 10 }, // 0
    { score: 8, totalQuestions: 50 }, // 1: no earlier 50-question attempt → null
    { score: 6, totalQuestions: 10 }, // 2: vs index 0 (both 10) → +2
    { score: 9, totalQuestions: 50 }, // 3: vs index 1 (both 50) → +1
  ];
  assert.equal(attemptDelta(attempts, 1), null, 'first 50-question run has no comparable prior');
  assert.equal(attemptDelta(attempts, 2), 2, 'skips the 50-question run to find the prior 10-question run');
  assert.equal(attemptDelta(attempts, 3), 1, 'a count-vs-percentage match on size still compares');
});

// --- degradeAttempts --------------------------------------------------------

test('degradeAttempts keeps score/counts but drops layout/answers/settings', () => {
  const full = buildAttempt(sampleRun(), 1);
  const [d] = degradeAttempts([full]);
  assert.equal(d.reviewable, false);
  assert.equal(d.score, full.score);
  assert.equal(d.correctCount, full.correctCount);
  assert.equal(d.totalQuestions, full.totalQuestions);
  assert.equal(d.takenAt, full.takenAt);
  assert.equal('processedQuizData' in d, false);
  assert.equal('answers' in d, false);
  assert.equal('settings' in d, false);
});

// --- migrateHistoryForEdit --------------------------------------------------

test('migrateHistoryForEdit moves and degrades old attempts to the new id', () => {
  const map = appendAttempt({}, 'old', buildAttempt(sampleRun(), 5));
  const next = migrateHistoryForEdit(map, 'old', 'new');
  assert.equal('old' in next, false, 'old id removed');
  assert.equal(next.new.length, 1);
  assert.equal(next.new[0].reviewable, false, 'moved attempts are score-only');
  assert.equal(next.new[0].score, 5);
});

test('migrateHistoryForEdit is a no-op when the id is unchanged or there is nothing to move', () => {
  const map = appendAttempt({}, 'same', buildAttempt(sampleRun(), 1));
  assert.equal(migrateHistoryForEdit(map, 'same', 'same'), map, 'same id → returns input unchanged');
  const emptyMap = {};
  assert.equal(migrateHistoryForEdit(emptyMap, 'missing', 'new'), emptyMap, 'nothing to move → returns input');
});

test('migrateHistoryForEdit merges into existing new-id attempts, sorted by time', () => {
  let map = appendAttempt({}, 'new', buildAttempt(sampleRun(), 10));
  map = appendAttempt(map, 'old', buildAttempt(sampleRun(), 3));
  const next = migrateHistoryForEdit(map, 'old', 'new');
  assert.deepEqual(next.new.map((a) => a.takenAt), [3, 10], 'merged oldest-first');
  assert.equal(next.new[0].reviewable, false, 'migrated one degraded');
  assert.equal(next.new[1].reviewable, true, 'pre-existing one untouched');
});

// --- persistence wrappers (fake localStorage) -------------------------------

function withLocalStorage(impl, callback) {
  const original = globalThis.localStorage;
  globalThis.localStorage = impl;
  try {
    return callback();
  } finally {
    if (original === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = original;
  }
}

const memoryStore = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    data,
  };
};

test('loadHistory returns an empty object when nothing is stored', () => {
  withLocalStorage(memoryStore(), () => {
    assert.deepEqual(loadHistory(), {});
  });
});

test('loadHistory falls back to an empty object on malformed or non-object data', () => {
  withLocalStorage(memoryStore({ quizHistory: '{bad json' }), () => {
    assert.deepEqual(loadHistory(), {});
  });
  withLocalStorage(memoryStore({ quizHistory: JSON.stringify([1, 2]) }), () => {
    assert.deepEqual(loadHistory(), {}, 'arrays are rejected');
  });
});

test('saveHistory then loadHistory round-trips the map', () => {
  const store = memoryStore();
  const map = appendAttempt({}, 'q', buildAttempt(sampleRun(), 7));
  withLocalStorage(store, () => {
    saveHistory(map);
    assert.deepEqual(loadHistory(), map);
  });
});

test('saveHistory swallows storage errors (e.g. quota exceeded)', () => {
  const throwingStore = {
    getItem: () => null,
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
  };
  withLocalStorage(throwingStore, () => {
    assert.doesNotThrow(() => saveHistory({ q: [] }));
  });
});

test('recordAttempt appends to storage and returns the prior attempts', () => {
  const store = memoryStore();
  withLocalStorage(store, () => {
    const a1 = buildAttempt(sampleRun(), 1);
    const prevA = recordAttempt('q', a1);
    assert.deepEqual(prevA, [], 'no prior attempts the first time');

    const a2 = buildAttempt(sampleRun(), 2);
    const prevB = recordAttempt('q', a2);
    assert.deepEqual(prevB, [a1], 'returns the prior attempt list');
    assert.deepEqual(getAttempts(loadHistory(), 'q'), [a1, a2]);
  });
});
