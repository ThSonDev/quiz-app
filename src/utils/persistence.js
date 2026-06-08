// Persistence layer shared by the saved-quiz library (storage.js) and results
// history (history.js).
//
// Why this exists: the rest of the app reads storage *synchronously* — e.g.
// `useState(() => loadLibrary())` and `editHasHistory` computed during render.
// IndexedDB, which we want for its much larger capacity and non-blocking writes,
// is *asynchronous*. To get both, we hydrate a small in-memory cache once at
// startup (hydrate(), called from main.jsx before the first render) and write
// through to IndexedDB in the background; synchronous reads come from the cache.
//
// If IndexedDB is unavailable (older browsers, Safari private mode, disabled),
// we fall back to localStorage exactly as before — reads/writes go straight to
// it, no cache needed since localStorage is itself synchronous. Legacy data left
// in localStorage by older versions is migrated into IndexedDB on first run.

import { idb as defaultIdb } from './idb.js';

const cache = new Map();
// 'memory' — before hydrate(): behaves like the localStorage fallback (so the
//            domain tests, which never hydrate, exercise the localStorage path).
// 'idb'    — hydrate() succeeded with IndexedDB: reads come from `cache`, writes
//            update the cache and write through to IndexedDB.
// 'local'  — IndexedDB unavailable/failed: read/write localStorage directly.
let backend = 'memory';
let kv = defaultIdb;

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — non-fatal; data just won't persist.
  }
}

function delLocal(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore — removing the migrated legacy copy is best-effort.
  }
}

// Load `keys` into the cache once, at startup. For each key: if IndexedDB has no
// value but legacy localStorage does, migrate it (copy into IndexedDB, drop the
// localStorage copy). Falls back to localStorage-only mode if IndexedDB is
// unavailable or errors at any point. Never throws.
export async function hydrate(keys) {
  if (kv.supported()) {
    try {
      for (const key of keys) {
        let value = await kv.get(key);
        if (value === undefined) {
          const legacy = readLocal(key);
          if (legacy !== undefined) {
            value = legacy;
            await kv.set(key, legacy);
            delLocal(key);
          }
        }
        if (value !== undefined) cache.set(key, value);
      }
      backend = 'idb';
      return;
    } catch {
      // Fall through to localStorage-only mode below.
    }
  }
  backend = 'local';
}

// Synchronous read. In IndexedDB mode this is the hydrated cache; otherwise it
// reads localStorage directly. `fallback` is returned when the key is absent.
export function readStore(key, fallback) {
  if (backend === 'idb') {
    return cache.has(key) ? cache.get(key) : fallback;
  }
  const value = readLocal(key);
  return value === undefined ? fallback : value;
}

// Synchronous write. In IndexedDB mode it updates the cache immediately and
// writes through to IndexedDB in the background (errors swallowed, like the old
// localStorage quota handling); otherwise it writes localStorage directly.
export function writeStore(key, value) {
  if (backend === 'idb') {
    cache.set(key, value);
    kv.set(key, value).catch(() => {});
    return;
  }
  writeLocal(key, value);
}

// --- test helpers -----------------------------------------------------------
// Inject a fake IndexedDB-like backend and reset module state between tests.
export function _setBackend(fakeKv) {
  kv = fakeKv ?? defaultIdb;
}
export function _reset() {
  cache.clear();
  backend = 'memory';
  kv = defaultIdb;
}
