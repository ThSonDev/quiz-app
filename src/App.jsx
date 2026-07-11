import { useEffect, useRef, useState } from 'react';
import JSONUploadPage from './components/pages/JSONUploadPage';
import QuizPage from './components/pages/QuizPage';
import ResultPage from './components/pages/ResultPage';
import ReviewPage from './components/pages/ReviewPage';
import QuizCreatorPage from './components/pages/QuizCreatorPage';
import HistoryPane from './components/ui/HistoryPane';
import ThemeToggle from './components/ui/ThemeToggle';
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';
import { useTheme } from './contexts/useTheme';
import { processQuizData } from './utils/utils';
import { loadLibrary, saveLibrary, replaceQuiz, upsertQuiz, hashQuiz } from './utils/storage';
import { parseShareParams, fetchSharedQuiz, quizNameFromUrl } from './utils/share';
import {
  loadHistory,
  saveHistory,
  getAttempts,
  hasHistory,
  buildAttempt,
  recordAttempt,
  attemptDelta,
  migrateHistoryForEdit,
} from './utils/history';

const App = () => {
  const { classes } = useTheme();

  // upload, quiz, results, review, create
  const [view, setView] = useState('upload');

  // Quiz data and state
  const [originalQuizData, setOriginalQuizData] = useState(null);
  const [processedQuizData, setProcessedQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Keeps the picked file alive across navigation so the user can come back
  // to the upload page without re-selecting it.
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);

  const [activeSettings, setActiveSettings] = useState({
    shuffleQuestions: false,
    shuffleOptions: false,
    quizSize: 100,
    quizSizeMode: 'percentage',
  });

  // The saved-library quiz currently open in the creator for editing, or null
  // when the creator is building a new quiz. Shape: { id, name, bookmarked, rawData }.
  const [editingQuiz, setEditingQuiz] = useState(null);

  // --- Results history view state -------------------------------------------
  // When the user opens a past attempt, `viewingAttempt` holds { attempt, original,
  // delta } and the results/review pages render that attempt's stored layout/answers
  // instead of the live run (the live slots are left untouched so returning to a
  // live review still works). `attemptOrigin` is where the "return back" button
  // goes ('review' or 'upload'). `liveDelta` is the live run's score change vs the
  // prior attempt; it is kept separate from a viewed attempt's delta so detouring
  // through history doesn't clobber it. `historyPane` drives the slide-over list.
  const [viewingAttempt, setViewingAttempt] = useState(null);
  const [attemptOrigin, setAttemptOrigin] = useState('upload');
  const [liveDelta, setLiveDelta] = useState(null);
  const [historyPane, setHistoryPane] = useState(null);
  // The id of the just-finished live attempt, so the history pane (opened from
  // its review) can badge it as "This attempt" and block re-opening it.
  const [currentAttemptId, setCurrentAttemptId] = useState(null);

  // --- Share-link import state ----------------------------------------------
  // When the app is opened via a share link (?quiz=...), we resolve the quiz
  // (from IndexedDB if already saved, else fetched through /api/proxy) and land
  // on a pre-configured upload card. `shareStatus` drives a loading/error
  // overlay; `pendingShareSettings` seeds the upload page's controls once.
  const [shareStatus, setShareStatus] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [shareError, setShareError] = useState('');
  const [pendingShareSettings, setPendingShareSettings] = useState(null);
  const importedRef = useRef(false);

  // Load the resolved quiz into the live slots and the upload card.
  const applyImportedQuiz = (rawData, name, settings) => {
    setOriginalQuizData(rawData);
    setUploadedFileInfo({ name, questionCount: rawData.questions.length, rawData });
    setActiveSettings(settings);
    setPendingShareSettings(settings);
    setShareStatus('idle');
    setView('upload');
  };

  const importSharedQuiz = async ({ url, qid, settings }) => {
    // Already in the library (matched by content hash)? Use it — no network
    // request, works fully offline. This is what saves a returning friend's
    // re-fetch.
    if (qid) {
      const existing = loadLibrary().find((e) => e.id === qid);
      if (existing) {
        applyImportedQuiz(existing.rawData, existing.name, settings);
        return;
      }
    }
    // Otherwise fetch through the proxy, validate, and persist.
    setShareStatus('loading');
    const { data, error } = await fetchSharedQuiz(url);
    if (error) {
      setShareError(error);
      setShareStatus('error');
      return;
    }
    if (data.questions.length < 2) {
      setShareError('Shared quiz must contain at least 2 questions.');
      setShareStatus('error');
      return;
    }
    const name = quizNameFromUrl(url);
    saveLibrary(upsertQuiz(loadLibrary(), { rawData: data, name }));
    applyImportedQuiz(data, name, settings);
  };

  // Resolve a share link exactly once on first load, then strip the params from
  // the URL so a refresh doesn't re-import (and the visible URL stays clean).
  useEffect(() => {
    if (importedRef.current) return;
    importedRef.current = true;
    const parsed = parseShareParams(window.location.search);
    if (!parsed) return;
    window.history.replaceState({}, '', window.location.pathname);
    importSharedQuiz(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHistoryView = viewingAttempt != null;
  const effectiveQuizData = isHistoryView ? viewingAttempt.attempt.processedQuizData : processedQuizData;
  const effectiveAnswers = isHistoryView ? viewingAttempt.attempt.answers : answers;
  const effectiveSettings = isHistoryView ? viewingAttempt.attempt.settings : activeSettings;
  const resultDelta = isHistoryView ? viewingAttempt.delta : liveDelta;

  // Finishing a live quiz: record the attempt, compute the delta vs the most
  // recent prior attempt, and show the (live) results. Called from QuizPage's
  // finish button so it fires exactly once per completion.
  const finishQuiz = () => {
    const quizId = hashQuiz(originalQuizData);
    const attempt = buildAttempt({ processedQuizData, answers, settings: activeSettings });
    const previous = recordAttempt(quizId, attempt);
    // Compare against the most recent prior attempt of the same size (see
    // attemptDelta); the new attempt sits at the end of the combined list.
    const all = [...previous, attempt];
    setLiveDelta(attemptDelta(all, all.length - 1));
    setCurrentAttemptId(attempt.attemptId);
    setViewingAttempt(null);
    setView('results');
  };

  // Open the history slide-over for a quiz. `origin` decides where a viewed
  // attempt's "return back" lands; `currentId` (review origin only) badges the
  // attempt being viewed so it can't be re-opened.
  const openHistoryPane = (quizId, name, origin, currentId = null) => {
    setHistoryPane({ quizId, name, origin, currentAttemptId: currentId, attempts: getAttempts(loadHistory(), quizId) });
  };
  const openHistoryFromReview = () =>
    openHistoryPane(hashQuiz(originalQuizData), uploadedFileInfo?.name ?? 'This quiz', 'review', currentAttemptId);
  const openHistoryFromLibrary = (entry) => openHistoryPane(entry.id, entry.name, 'upload');

  // Open a past (reviewable) attempt: load its stored layout/answers/settings
  // into the view, look up its source quiz for retries, and show its results.
  const selectHistoryAttempt = (attempt, index) => {
    const { quizId, origin, attempts } = historyPane;
    // For "new shuffle" retries we need the full original quiz; fall back to the
    // stored layout if the source quiz has since been removed from the library.
    const original = loadLibrary().find((e) => e.id === quizId)?.rawData ?? attempt.processedQuizData;
    // Delta vs the most recent earlier attempt of the same size at this point in history.
    const delta = attemptDelta(attempts, index);
    setViewingAttempt({ attempt, original, delta });
    setAttemptOrigin(origin);
    setHistoryPane(null);
    setView('results');
  };

  // Leave a viewed attempt, returning to wherever the history was opened from.
  const returnFromAttempt = () => {
    const origin = attemptOrigin;
    setViewingAttempt(null);
    setView(origin === 'review' ? 'review' : 'upload');
  };

  // Retry handlers, shared by live results and viewed attempts. From a viewed
  // attempt they first promote its layout/settings/source into the live slots
  // and clear the history view, so the subsequent finish records normally.
  const startRetry = (reshuffle) => {
    const original = isHistoryView ? viewingAttempt.original : originalQuizData;
    const settings = isHistoryView ? viewingAttempt.attempt.settings : activeSettings;
    const sameLayout = isHistoryView ? viewingAttempt.attempt.processedQuizData : processedQuizData;
    if (isHistoryView) {
      setOriginalQuizData(original);
      setActiveSettings(settings);
      setViewingAttempt(null);
    }
    setAnswers({});
    setCurrentQuestion(0);
    setLiveDelta(null);
    setProcessedQuizData(reshuffle ? processQuizData(original, settings) : sameLayout);
    setView('quiz');
  };
  const retrySameLayout = () => startRetry(false);
  const retryNewShuffle = () => startRetry(true);

  // Persist an edited quiz back to the library (new content gets a new id; the
  // old entry is replaced, time bumped, bookmark carried over), reload it into
  // the upload card, and return to the upload page. Its results history is moved
  // to the new id as score-only records (reviewing old attempts no longer makes
  // sense once the questions change).
  const saveEditedQuiz = (builtData, name) => {
    const newId = hashQuiz(builtData);
    const entries = replaceQuiz(
      loadLibrary(),
      editingQuiz.id,
      { rawData: builtData, name },
      editingQuiz.bookmarked,
    );
    saveLibrary(entries);
    saveHistory(migrateHistoryForEdit(loadHistory(), editingQuiz.id, newId));
    setUploadedFileInfo({ name, questionCount: builtData.questions.length, rawData: builtData });
    setOriginalQuizData(builtData);
    setEditingQuiz(null);
    setView('upload');
  };

  const editHasHistory = editingQuiz ? hasHistory(loadHistory(), editingQuiz.id) : false;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${classes.pageGradient}`}>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {view === 'upload' && (
        <JSONUploadPage
          setView={setView}
          setOriginalQuizData={setOriginalQuizData}
          setProcessedQuizData={setProcessedQuizData}
          setActiveSettings={setActiveSettings}
          setAnswers={setAnswers}
          setCurrentQuestion={setCurrentQuestion}
          uploadedFileInfo={uploadedFileInfo}
          setUploadedFileInfo={setUploadedFileInfo}
          setEditingQuiz={setEditingQuiz}
          onOpenHistory={openHistoryFromLibrary}
          initialSettings={pendingShareSettings}
          onShareConsumed={() => setPendingShareSettings(null)}
        />
      )}

      {view === 'quiz' && (
        <QuizPage
          quizData={processedQuizData}
          answers={answers}
          setAnswers={setAnswers}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          setView={setView}
          onFinish={finishQuiz}
        />
      )}

      {view === 'results' && (
        <ResultPage
          quizData={effectiveQuizData}
          answers={effectiveAnswers}
          settings={effectiveSettings}
          isHistoryView={isHistoryView}
          delta={resultDelta}
          onReviewAnswers={() => setView('review')}
          onRetrySameLayout={retrySameLayout}
          onRetryNewShuffle={retryNewShuffle}
          onReturnBack={returnFromAttempt}
          setAnswers={setAnswers}
          setCurrentQuestion={setCurrentQuestion}
          setView={setView}
        />
      )}

      {view === 'review' && (
        <ReviewPage
          quizData={effectiveQuizData}
          answers={effectiveAnswers}
          setView={setView}
          onOpenHistory={isHistoryView ? undefined : openHistoryFromReview}
        />
      )}

      {view === 'create' && (
        <QuizCreatorPage
          setView={setView}
          editingQuiz={editingQuiz}
          setEditingQuiz={setEditingQuiz}
          onSaveEdit={saveEditedQuiz}
          editHasHistory={editHasHistory}
        />
      )}

      {historyPane && (
        <HistoryPane
          quizName={historyPane.name}
          attempts={historyPane.attempts}
          currentAttemptId={historyPane.currentAttemptId}
          onSelect={selectHistoryAttempt}
          onClose={() => setHistoryPane(null)}
        />
      )}

      {shareStatus === 'loading' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${classes.cardBg} rounded-xl shadow-2xl p-8 max-w-sm w-full text-center animate-fadeInUp`}>
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className={`font-medium ${classes.textColor}`}>Loading shared quiz…</p>
            <p className={`text-sm ${classes.mutedText} mt-1`}>Fetching from the link</p>
          </div>
        </div>
      )}

      {shareStatus === 'error' && (
        <Modal title="Couldn't open shared quiz" description={shareError} onClose={() => setShareStatus('idle')}>
          <Button onClick={() => setShareStatus('idle')} className="w-full">
            Go to upload
          </Button>
        </Modal>
      )}
    </div>
  );
};

export default App;
