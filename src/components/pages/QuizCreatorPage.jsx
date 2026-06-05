import { useRef, useState } from 'react';
import QuestionEditor from '../ui/QuestionEditor';
import Modal from '../ui/Modal';
import { downloadQuizFile, validateQuizData } from '../../utils/utils';
import { useTheme } from '../../contexts/useTheme';
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

  const handleImport = (e) => {
    const file = e.target.files[0];
    // Reset the input so re-selecting the same file fires onChange again.
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const validationError = validateQuizData(data);
        if (validationError) {
          setError(validationError);
          return;
        }
        setError('');
        const imported = quizToCreatorQuestions(data);
        // Guard against silently discarding in-progress work.
        if (hasContent) setPendingImport(imported);
        else setQuestions(imported);
      } catch {
        setError('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={requestExit}
            className={`px-4 py-2 ${
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
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${classes.secondaryBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Previous
              </button>
              <span className={`text-sm font-medium ${classes.mutedText}`}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${classes.secondaryBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Next
              </button>
            </div>
          )}

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

          <button
            type="button"
            onClick={addQuestion}
            className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
          >
            Add Question
          </button>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${classes.secondaryBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Previous
              </button>
              <span className={`text-sm font-medium ${classes.mutedText}`}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${classes.secondaryBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Next
              </button>
            </div>
          )}

          <div className={`mt-8 p-5 ${classes.innerBg} rounded-xl space-y-4`}>
            {isEditing && (
              <button
                type="button"
                onClick={handleSaveEdit}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                title="Save changes and return to upload"
              >
                Save Changes
              </button>
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
                  <button
                    type="button"
                    onClick={() => handleDownload('json')}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
                    title="Download as .json"
                  >
                    Download as .json
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload('txt')}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
                    title="Download as .txt"
                  >
                    Download as .txt
                  </button>
                </div>

                <p className={`text-xs ${classes.mutedText}`}>
                  Both formats contain the same JSON content. Pick whichever extension you prefer.
                </p>
              </>
            )}

            {error && (
              <div className={`${
                isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
              } border px-4 py-3 rounded-lg`}>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showExitModal && (
        <Modal
          title="Discard quiz?"
          description="Your unsaved quiz will be lost. Download it first if you want to keep it."
        >
          <button
            type="button"
            onClick={confirmExit}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
          >
            Yes, Discard
          </button>
          <button
            type="button"
            onClick={() => setShowExitModal(false)}
            className={`w-full px-6 py-3 ${classes.secondaryBtn} rounded-lg font-medium transition-all`}
          >
            Cancel
          </button>
        </Modal>
      )}

      {pendingImport && (
        <Modal
          title="Replace current quiz?"
          description="Uploading will replace the questions you have now. This cannot be undone."
        >
          <button
            type="button"
            onClick={confirmImport}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => setPendingImport(null)}
            className={`w-full px-6 py-3 ${classes.secondaryBtn} rounded-lg font-medium transition-all`}
          >
            Cancel
          </button>
        </Modal>
      )}
    </div>
  );
};

export default QuizCreatorPage;
