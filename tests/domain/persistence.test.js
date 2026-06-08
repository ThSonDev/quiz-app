import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hydrate,
  readStore,
  writeStore,
  _setBackend,
  _reset,
} from '../../src/utils/persistence.js';

// A fake IndexedDB-like key-value backend (async, in-memory). `supported`
// toggles the unavailable path; `failOn` makes the named op reject so the
// localStorage fallback / error swallowing can be exercised.
function fakeIdb({ supported = true, failOn = null } = {}) {
  const store = new Map();
  const maybeFail = (name) => {
    if (failOn === name) throw new Error(`idb ${name} failed`);
  };
  return {
    supported: () => supported,
    get: async (k) => { maybeFail('get'); return store.get(k); },
    set: async (k, v) => { maybeFail('set'); store.set(k, v); },
    del: async (k) => { maybeFail('del'); store.delete(k); },
    store,
  };
}

// Swap a fake localStorage onto globalThis for the duration of an async callback.
async function withLocalStorage(impl, callback) {
  const original = globalThis.localStorage;
  globalThis.localStorage = impl;
  try {
    return await callback();
  } finally {
    if (original === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = original;
  }
}

const memoryStore = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: (key) => { delete data[key]; },
    data,
  };
};

// --- hydrate / read -----------------------------------------------------------

test('hydrate loads existing IndexedDB values into the cache', async () => {
  _reset();
  const kv = fakeIdb();
  kv.store.set('quizLibrary', [{ id: 'a' }]);
  _setBackend(kv);
  await hydrate(['quizLibrary']);
  assert.deepEqual(readStore('quizLibrary', []), [{ id: 'a' }]);
});

test('readStore returns the fallback when a key is absent', async () => {
  _reset();
  _setBackend(fakeIdb());
  await hydrate(['quizLibrary']);
  assert.deepEqual(readStore('quizLibrary', []), []);
  assert.deepEqual(readStore('missing', { a: 1 }), { a: 1 });
});

// --- migration from legacy localStorage --------------------------------------

test('hydrate migrates legacy localStorage into IndexedDB and removes the old copy', async () => {
  _reset();
  const kv = fakeIdb();
  _setBackend(kv);
  const local = memoryStore({ quizLibrary: JSON.stringify([{ id: 'x' }]) });
  await withLocalStorage(local, () => hydrate(['quizLibrary']));
  assert.deepEqual(kv.store.get('quizLibrary'), [{ id: 'x' }], 'copied into IndexedDB');
  assert.deepEqual(readStore('quizLibrary', []), [{ id: 'x' }], 'served from the cache');
  assert.equal('quizLibrary' in local.data, false, 'legacy localStorage copy removed after migration');
});

test('hydrate prefers existing IndexedDB data over legacy localStorage', async () => {
  _reset();
  const kv = fakeIdb();
  kv.store.set('quizLibrary', [{ id: 'idb' }]);
  _setBackend(kv);
  const local = memoryStore({ quizLibrary: JSON.stringify([{ id: 'local' }]) });
  await withLocalStorage(local, () => hydrate(['quizLibrary']));
  assert.deepEqual(readStore('quizLibrary', []), [{ id: 'idb' }]);
  assert.equal('quizLibrary' in local.data, true, 'no migration runs when IndexedDB already has the key');
});

// --- write-through ------------------------------------------------------------

test('writeStore updates the cache synchronously and writes through to IndexedDB', async () => {
  _reset();
  const kv = fakeIdb();
  _setBackend(kv);
  await hydrate(['quizLibrary']);
  writeStore('quizLibrary', [{ id: 'new' }]);
  assert.deepEqual(readStore('quizLibrary', []), [{ id: 'new' }], 'cache updated immediately');
  await Promise.resolve();
  assert.deepEqual(kv.store.get('quizLibrary'), [{ id: 'new' }], 'written through to IndexedDB');
});

test('writeStore swallows IndexedDB write errors but still updates the cache', async () => {
  _reset();
  _setBackend(fakeIdb({ failOn: 'set' }));
  await hydrate(['quizLibrary']);
  assert.doesNotThrow(() => writeStore('quizLibrary', [{ id: 'z' }]));
  assert.deepEqual(readStore('quizLibrary', []), [{ id: 'z' }], 'cache updated even when the write fails');
});

// --- localStorage fallback ----------------------------------------------------

test('hydrate falls back to localStorage when IndexedDB is unavailable', async () => {
  _reset();
  _setBackend(fakeIdb({ supported: false }));
  const local = memoryStore({ quizLibrary: JSON.stringify([{ id: 'fb' }]) });
  await withLocalStorage(local, async () => {
    await hydrate(['quizLibrary']);
    assert.deepEqual(readStore('quizLibrary', []), [{ id: 'fb' }], 'reads localStorage directly');
    writeStore('quizLibrary', [{ id: 'fb2' }]);
    assert.equal(local.data.quizLibrary, JSON.stringify([{ id: 'fb2' }]), 'writes localStorage directly');
  });
});

test('hydrate falls back to localStorage when IndexedDB errors mid-hydrate', async () => {
  _reset();
  _setBackend(fakeIdb({ failOn: 'get' }));
  const local = memoryStore({ quizHistory: JSON.stringify({ q: [] }) });
  await withLocalStorage(local, async () => {
    await hydrate(['quizHistory']);
    assert.deepEqual(readStore('quizHistory', {}), { q: [] });
  });
  _reset();
});
