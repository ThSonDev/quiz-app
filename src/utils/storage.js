// Client-side quiz library. No backend: quizzes are content-addressed so
// re-uploading the same file maps to the same entry. Pure helpers
// (hashQuiz/upsertQuiz/removeQuiz/toggleBookmark/sortLibrary) operate on plain
// arrays and are unit-tested; loadLibrary/saveLibrary are the thin wrappers over
// the shared persistence layer (IndexedDB-backed, localStorage fallback).

import { readStore, writeStore } from './persistence.js';

export const STORAGE_KEY = 'quizLibrary';

// cyrb53: a fast non-cryptographic hash. We only need a stable id from the
// quiz content, not security, so a sync hash keeps the upload flow simple.
export function hashQuiz(rawData) {
  const str = JSON.stringify(rawData.questions ?? rawData);
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const id = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return id.toString(36);
}

// Adds a freshly uploaded quiz, or — when the same content already exists —
// bumps its name/count/time instead of duplicating. Returns a new array;
// caller persists. `now` is injectable for deterministic tests.
export function upsertQuiz(entries, { rawData, name }, now = Date.now()) {
  const id = hashQuiz(rawData);
  const questionCount = rawData.questions.length;
  if (entries.some((e) => e.id === id)) {
    return entries.map((e) =>
      e.id === id ? { ...e, name, questionCount, uploadedAt: now } : e
    );
  }
  return [
    ...entries,
    { id, name, questionCount, uploadedAt: now, bookmarked: false, rawData },
  ];
}

export function removeQuiz(entries, id) {
  return entries.filter((e) => e.id !== id);
}

// Replaces the quiz `oldId` with its edited content (which may hash to a new id),
// stamped with `now` and carrying the previous bookmark forward. Used when
// saving edits from the creator. `now` is injectable for deterministic tests.
export function replaceQuiz(entries, oldId, { rawData, name }, bookmarked = false, now = Date.now()) {
  const added = upsertQuiz(removeQuiz(entries, oldId), { rawData, name }, now);
  if (!bookmarked) return added;
  const newId = hashQuiz(rawData);
  return added.map((e) => (e.id === newId ? { ...e, bookmarked: true } : e));
}

export function toggleBookmark(entries, id) {
  return entries.map((e) => (e.id === id ? { ...e, bookmarked: !e.bookmarked } : e));
}

// Bookmarked entries pinned to the top, then most-recently-uploaded first.
export function sortLibrary(entries) {
  return [...entries].sort((a, b) => {
    if (a.bookmarked !== b.bookmarked) return a.bookmarked ? -1 : 1;
    return b.uploadedAt - a.uploadedAt;
  });
}

export function loadLibrary() {
  const data = readStore(STORAGE_KEY, []);
  return Array.isArray(data) ? data : [];
}

export function saveLibrary(entries) {
  writeStore(STORAGE_KEY, entries);
}
