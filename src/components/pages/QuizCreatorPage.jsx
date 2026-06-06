import { useRef, useState } from 'react';
import QuestionEditor from '../ui/QuestionEditor';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ErrorBanner from '../ui/ErrorBanner';
import Pagination from '../ui/Pagination';
import { downloadQuizFile, readQuizFile } from '../../utils/utils';
import { useTheme } from '../../contexts/useTheme';
import { useBackGuard } from '../../hooks/useBackGuard';
import { buildQuizPayload, emptyQuestion, quizToCreatorQuestions } from '../../utils/quizCreator';

const stripExtension = (name) => name.replace(/\.(json|txt)$/i, '');

const QuizCreatorPage = ({ setView, editingQuiz = null, setEditingQuiz, onSaveEdit }) => {
  const { isDarkMode, classes } = useTheme();
  const isEditing = Boolean(editingQuiz);
  // In edit mode, seed the editor from the saved quiz; otherwise start blank.
  const [questions, setQuestions] = useState(() =>
    editingQuiz ? quizToCreatorQuestions(editingQuiz.rawData) : [emptyQuestion(), emptyQuestion()]
  );
  const [filename, setFilename] = useState(() =>
    editingQuiz ? stripExtension(editingQuiz.name) : 'my-quiz'
  );
  const [error, setError] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  // Questions parsed from an upload, held until the user confirms replacing
  // their current work. null when no import is awaiting confirmation.
  const [pendingImport, setPendingImport] = useState(null);
  const importInputRef = useRef(null);

  // Paginate the question editors 10 per page; the actions box below stays put.
  const PER_PAGE = 10;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(questions.length / PER_PAGE));
  // Clamp so removing questions on the last page can't strand us past the end.
  const currentPage = Math.min(page, totalPages - 1);

  const addQuestion = () => {
    // Jump to the page the new (appended) question lands on.
    setPage(Math.floor(questions.length / PER_PAGE));
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const updateQuestion = (idx, updated) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? updated : q)));
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDownload = (extension) => {
    const result = buildQuizPayload(questions);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError('');
    downloadQuizFile(result.data, filename, extension);
  };

  // Save edits back to the library (App handles persistence + navigation).
  const handleSaveEdit = () => {
    const result = buildQuizPayload(questions);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError('');
    onSaveEdit(result.data, filename.trim() || editingQuiz.name);
  };

  const hasContent = questions.some(
    (q) => q.question.trim() || q.options.some((o) => o.text.trim()) || q.explanation.trim()
  );

  const handleImport = async (e) => {
    const file = e.target.files[0];
    // Reset the input so re-selecting the same file fires onChange again.
    e.target.value = '';
    if (!file) return;

    const { data, error: parseError } = await readQuizFile(file);
    if (parseError) {
      setError(parseError);
      return;
    }
    setError('');
    const imported = quizToCreatorQuestions(data);
    // Guard against silently discarding in-progress work.
    if (hasContent) setPendingImport(imported);
    else setQuestions(imported);
  };

  const confirmImport = () => {
    setQuestions(pendingImport);
    setPendingImport(null);
  };

  const requestExit = () => {
    if (hasContent) setShowExitModal(true);
    else {
      setEditingQuiz(null);
      setView('upload');
    }
  };

  const confirmExit = () => {
    setShowExitModal(false);
    setEditingQuiz(null);
    setView('upload');
  };

  // Mobile/browser Back behaves like the on-screen "Back to Upload" button
  // (confirms first if there is unsaved work) instead of leaving the app.
  useBackGuard(requestExit);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-4 flex flex-wrap gap-3 sticky top-4 z-20">
          <button
            type="button"
            onClick={requestExit}
            className={`px-4 py-2 shadow-lg ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'
            } text-white rounded-lg font-medium transition-all`}
            title="Back to Upload"
          >
            Back to Upload
          </button>
          {!isEditing && (
            <>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="px-4 py-2 shadow-lg bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
                title="Upload an existing quiz to edit"
              >
                Upload Your Quiz
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".json,.txt"
                onChange={handleImport}
                className="hidden"
              />
            </>
          )}
        </div>

        <div className={`${classes.cardBg} rounded-2xl shadow-2xl p-6 sm:p-8`}>
          <div className="mb-6">
            <h1 className={`text-3xl font-bold ${classes.textColor} mb-2`}>
              {isEditing ? 'Edit Quiz' : 'Quiz Creator'}
            </h1>
            <p className={classes.mutedText}>
              {isEditing
                ? 'Add, edit, or remove questions, then save your changes back to the saved quiz.'
                : 'Build a quiz from scratch, or upload an existing JSON or TXT quiz to add, edit, and remove questions. Download the result and upload it back from the home page to take the quiz.'}
            </p>
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
            className="mb-5"
          />

          <div className="space-y-5">
            {questions
              .slice(currentPage * PER_PAGE, currentPage * PER_PAGE + PER_PAGE)
              .map((q, i) => {
                // Absolute index into `questions` so edits/removes hit the right one.
                const idx = currentPage * PER_PAGE + i;
                return (
                  <QuestionEditor
                    key={idx}
                    question={q}
                    index={idx}
                    onChange={(updated) => updateQuestion(idx, updated)}
                    onRemove={() => removeQuestion(idx)}
                    canRemove={questions.length > 1}
                  />
                );
              })}
          </div>

          <Button type="button" onClick={addQuestion} className="w-full mt-6">
            Add Question
          </Button>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
            className="mt-6"
          />

          <div className={`mt-8 p-5 ${classes.innerBg} rounded-xl space-y-4`}>
            {isEditing && (
              <Button
                type="button"
                variant="success"
                onClick={handleSaveEdit}
                className="w-full font-semibold"
                title="Save changes and return to upload"
              >
                Save Changes
              </Button>
            )}

            <div>
              <label
                htmlFor="quizFilename"
                className={`block text-sm font-medium ${classes.mutedText} mb-1`}
              >
                File name
              </label>
              <input
                id="quizFilename"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className={`w-full px-4 py-2 border-2 ${classes.inputBg} rounded-lg focus:outline-none focus:border-indigo-500`}
                placeholder="my-quiz"
              />
            </div>

            {!isEditing && (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    onClick={() => handleDownload('json')}
                    className="flex-1"
                    title="Download as .json"
                  >
                    Download as .json
                  </Button>
                  <Button
                    type="button"
                    variant="purple"
                    onClick={() => handleDownload('txt')}
                    className="flex-1"
                    title="Download as .txt"
                  >
                    Download as .txt
                  </Button>
                </div>

                <p className={`text-xs ${classes.mutedText}`}>
                  Both formats contain the same JSON content. Pick whichever extension you prefer.
                </p>
              </>
            )}

            <ErrorBanner>{error}</ErrorBanner>
          </div>
        </div>
      </div>

      {showExitModal && (
        <Modal
          title="Discard quiz?"
          description="Your unsaved quiz will be lost. Download it first if you want to keep it."
        >
          <Button type="button" variant="danger" onClick={confirmExit} className="w-full">
            Yes, Discard
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowExitModal(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </Modal>
      )}

      {pendingImport && (
        <Modal
          title="Replace current quiz?"
          description="Uploading will replace the questions you have now. This cannot be undone."
        >
          <Button type="button" variant="emerald" onClick={confirmImport} className="w-full">
            Replace
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPendingImport(null)}
            className="w-full"
          >
            Cancel
          </Button>
        </Modal>
      )}
    </div>
  );
};

export default QuizCreatorPage;
