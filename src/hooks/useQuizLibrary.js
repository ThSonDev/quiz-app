import { useState } from 'react';
import {
  loadLibrary,
  saveLibrary,
  upsertQuiz,
  removeQuiz,
  toggleBookmark,
} from '../utils/storage';

// Owns the saved-quiz library state and the read-modify-persist cycle. Each
// mutation re-reads from storage so it stays correct even if another tab wrote
// in between, then persists and updates local state in one step.
export function useQuizLibrary() {
  const [library, setLibrary] = useState(() => loadLibrary());

  const persist = (entries) => {
    saveLibrary(entries);
    setLibrary(entries);
  };

  return {
    library,
    saveQuiz: (rawData, name) => persist(upsertQuiz(loadLibrary(), { rawData, name })),
    removeFromLibrary: (id) => persist(removeQuiz(loadLibrary(), id)),
    toggleBookmark: (id) => persist(toggleBookmark(loadLibrary(), id)),
  };
}
