// Thin promise wrapper over IndexedDB, used as a plain key-value store (one
// database, one object store). It exists only to back persistence.js — the rest
// of the app reads through that cache — so this file doesn't need to be clever:
// it's just a durable, much-higher-capacity replacement for localStorage's
// getItem/setItem/removeItem, with the values stored as structured objects
// (no JSON.stringify needed; IndexedDB clones them directly).

const DB_NAME = 'quizApp';
const DB_VERSION = 1;
const STORE = 'keyval';

let dbPromise = null;

function supported() {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

// Run one operation inside a transaction and resolve when it commits (so writes
// are durable before the promise settles). `op` gets the object store and may
// return a request whose `.result` becomes the resolved value (used by `get`).
function run(mode, op) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = op(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(request ? request.result : undefined);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
}

export const idb = {
  supported,
  get: (key) => run('readonly', (store) => store.get(key)),
  set: (key, value) => run('readwrite', (store) => store.put(value, key)),
  del: (key) => run('readwrite', (store) => store.delete(key)),
};
