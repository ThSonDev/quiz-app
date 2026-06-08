// Results history: an append-only list of attempts per quiz. Quizzes are keyed
// by the same content-hash id the library uses (storage.js), so a quiz's history
// follows its content. Pure helpers operate on a plain `{ [quizId]: Attempt[] }`
// map (attempts oldest-first) and are unit-tested; loadHistory/saveHistory are
// the thin wrappers over the shared persistence layer (IndexedDB-backed,
// localStorage fallback).
//
// A "reviewable" attempt stores the exact layout shown (processedQuizData) and
// the user's answers, so a past attempt can be re-opened for review or retried
// with the same layout. When a quiz is edited (its content — and id — change),
// its old attempts are *degraded* to score-only records: the final score and
// counts are kept, but the layout/answers are dropped (they no longer match the
// edited questions), so they can no longer be reviewed. See migrateHistoryForEdit.

import { summarizeResults } from './utils.js';
import { readStore, writeStore } from './persistence.js';

export const HISTORY_KEY = 'quizHistory';

// Build a full (reviewable) attempt record from a finished run. `now` is
// injectable for deterministic tests.
export function buildAttempt({ processedQuizData, answers, settings }, now = Date.now()) {
  const { correctCount, partialCount, incorrectCount, totalQuestions, score } =
    summarizeResults(processedQuizData.questions, answers);
  return {
    attemptId: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    takenAt: now,
    score,
    correctCount,
    partialCount,
    incorrectCount,
    totalQuestions,
    settings,
    processedQuizData,
    answers,
    reviewable: true,
  };
}

// Returns a new map with `attempt` appended to `quizId`'s list (oldest-first).
export function appendAttempt(historyMap, quizId, attempt) {
  return { ...historyMap, [quizId]: [...(historyMap[quizId] ?? []), attempt] };
}

export function getAttempts(historyMap, quizId) {
  return historyMap[quizId] ?? [];
}

export function hasHistory(historyMap, quizId) {
  return getAttempts(historyMap, quizId).length > 0;
}

// Score difference (out of 10, positive = improvement) between the attempt at
// `index` and the most recent *prior* attempt of the same size — i.e. the same
// `totalQuestions`. Comparing only same-size runs keeps the delta meaningful: a
// 5-question run and a 50-question run aren't comparable, but a 50-question run
// configured by count and one by percentage that happen to land on 50 are.
// null when there is no comparable earlier attempt.
export function attemptDelta(attempts, index) {
  if (index <= 0 || index >= attempts.length) return null;
  const current = attempts[index];
  for (let i = index - 1; i >= 0; i -= 1) {
    if (attempts[i].totalQuestions === current.totalQuestions) {
      return current.score - attempts[i].score;
    }
  }
  return null;
}

// Strip a reviewable attempt down to a score-only record: keep the score/counts
// and timestamp, drop the layout/answers/settings (which no longer apply after
// an edit). reviewable: false marks it as not openable for review.
export function degradeAttempts(attempts) {
  return attempts.map((a) => ({
    attemptId: a.attemptId,
    takenAt: a.takenAt,
    score: a.score,
    correctCount: a.correctCount,
    partialCount: a.partialCount,
    incorrectCount: a.incorrectCount,
    totalQuestions: a.totalQuestions,
    reviewable: false,
  }));
}

// Move `oldId`'s history to `newId` when an edit changes a quiz's content (and
// thus its id), degrading the moved attempts to score-only. If the id is
// unchanged (content identical) or there is nothing to move, the map is
// returned as-is. Any attempts already under `newId` are kept and merged,
// re-sorted oldest-first by time.
export function migrateHistoryForEdit(historyMap, oldId, newId) {
  const old = historyMap[oldId] ?? [];
  if (oldId === newId || old.length === 0) return historyMap;
  const rest = { ...historyMap };
  delete rest[oldId];
  const merged = [...(rest[newId] ?? []), ...degradeAttempts(old)].sort(
    (a, b) => a.takenAt - b.takenAt
  );
  return { ...rest, [newId]: merged };
}

export function loadHistory() {
  const data = readStore(HISTORY_KEY, {});
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
}

export function saveHistory(historyMap) {
  writeStore(HISTORY_KEY, historyMap);
}

// Convenience wrapper used by the app: load, append the attempt, persist.
// Returns the previous (pre-append) attempts list so the caller can compute the
// score delta against the most recent prior attempt.
export function recordAttempt(quizId, attempt) {
  const map = loadHistory();
  const previous = getAttempts(map, quizId);
  saveHistory(appendAttempt(map, quizId, attempt));
  return previous;
}
