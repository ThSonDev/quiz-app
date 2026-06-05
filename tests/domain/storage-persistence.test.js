import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLibrary, saveLibrary } from '../../src/utils/storage.js';

// Swap a fake localStorage onto globalThis for the duration of a callback.
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

test('loadLibrary returns an empty array when nothing is stored', () => {
  withLocalStorage(memoryStore(), () => {
    assert.deepEqual(loadLibrary(), []);
  });
});

test('loadLibrary parses a stored library array', () => {
  const entries = [{ id: 'a', name: 'q.json', questionCount: 2, uploadedAt: 1, bookmarked: false }];
  withLocalStorage(memoryStore({ quizLibrary: JSON.stringify(entries) }), () => {
    assert.deepEqual(loadLibrary(), entries);
  });
});

test('loadLibrary falls back to an empty array on malformed JSON', () => {
  withLocalStorage(memoryStore({ quizLibrary: '{not valid json' }), () => {
    assert.deepEqual(loadLibrary(), []);
  });
});

test('loadLibrary ignores stored values that are not arrays', () => {
  withLocalStorage(memoryStore({ quizLibrary: JSON.stringify({ not: 'an array' }) }), () => {
    assert.deepEqual(loadLibrary(), []);
  });
});

test('saveLibrary serializes entries under the quizLibrary key', () => {
  const store = memoryStore();
  const entries = [{ id: 'a', name: 'q.json', questionCount: 2, uploadedAt: 1, bookmarked: true }];
  withLocalStorage(store, () => {
    saveLibrary(entries);
  });
  assert.equal(store.data.quizLibrary, JSON.stringify(entries));
});

test('saveLibrary then loadLibrary round-trips the data', () => {
  const store = memoryStore();
  const entries = [{ id: 'b', name: 'r.txt', questionCount: 5, uploadedAt: 99, bookmarked: false }];
  withLocalStorage(store, () => {
    saveLibrary(entries);
    assert.deepEqual(loadLibrary(), entries);
  });
});

test('saveLibrary swallows storage errors (e.g. quota exceeded)', () => {
  const throwingStore = {
    getItem: () => null,
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
  };
  withLocalStorage(throwingStore, () => {
    assert.doesNotThrow(() => saveLibrary([{ id: 'a' }]));
  });
});
