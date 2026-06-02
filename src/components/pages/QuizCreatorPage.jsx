import { useState } from 'react';
import QuestionEditor from '../ui/QuestionEditor';
import Modal from '../ui/Modal';
import { downloadQuizFile } from '../../utils/utils';
import { useTheme } from '../../contexts/useTheme';
import { buildQuizPayload, emptyQuestion } from '../../utils/quizCreator';

const QuizCreatorPage = ({ setView }) => {
  const { isDarkMode, classes } = useTheme();
  const [questions, setQuestions] = useState([emptyQuestion(), emptyQuestion()]);
  const [filename, setFilename] = useState('my-quiz');
  const [error, setError] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);

  const addQuestion = () => {
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

  const hasContent = questions.some(
    (q) => q.question.trim() || q.options.some((o) => o.text.trim()) || q.explanation.trim()
  );

  const requestExit = () => {
    if (hasContent) setShowExitModal(true);
    else setView('upload');
  };

  const confirmExit = () => {
    setShowExitModal(false);
    setView('upload');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-4">
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
        </div>

        <div className={`${classes.cardBg} rounded-2xl shadow-2xl p-6 sm:p-8`}>
          <div className="mb-6">
            <h1 className={`text-3xl font-bold ${classes.textColor} mb-2`}>Quiz Creator</h1>
            <p className={classes.mutedText}>
              Build a quiz and download it as a JSON or TXT file. You can upload it back
              from the home page to take the quiz.
            </p>
          </div>

          <div className="space-y-5">
            {questions.map((q, idx) => (
              <QuestionEditor
                key={idx}
                question={q}
                index={idx}
                onChange={(updated) => updateQuestion(idx, updated)}
                onRemove={() => removeQuestion(idx)}
                canRemove={questions.length > 1}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
          >
            Add Question
          </button>

          <div className={`mt-8 p-5 ${classes.innerBg} rounded-xl space-y-4`}>
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
    </div>
  );
};

export default QuizCreatorPage;
