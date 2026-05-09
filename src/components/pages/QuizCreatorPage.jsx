import { useState } from 'react';
import QuestionEditor from '../ui/QuestionEditor';
import { downloadQuizFile } from '../../utils/utils';

const emptyQuestion = () => ({
  question: '',
  type: 'single',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
  explanation: '',
  noShuffleOptions: false,
});

// Converts the creator's internal question shape into the format expected by
// validateQuizData (the same shape uploaded files must follow). Returns
// { error } on the first invalid question, or { data } on success.
function buildQuizPayload(questions) {
  const built = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const text = q.question.trim();
    if (!text) return { error: `Question ${i + 1} is missing its text` };

    const trimmedOptions = q.options.map((o) => o.text.trim());
    if (trimmedOptions.some((t) => !t)) {
      return { error: `Question ${i + 1} has an empty option` };
    }
    if (trimmedOptions.length < 2) {
      return { error: `Question ${i + 1} needs at least 2 options` };
    }

    const correctIndices = q.options
      .map((o, idx) => (o.isCorrect ? idx : -1))
      .filter((idx) => idx !== -1);

    if (correctIndices.length === 0) {
      return { error: `Question ${i + 1} needs at least one correct answer` };
    }
    if (q.type === 'multi' && correctIndices.length < 2) {
      return {
        error: `Question ${i + 1} is set to Multiple Choice but only has 1 correct answer`,
      };
    }

    const exported = {
      question: text,
      options: trimmedOptions,
      correctAnswer: q.type === 'multi' ? correctIndices : correctIndices[0],
    };
    if (q.explanation.trim()) exported.explanation = q.explanation.trim();
    if (q.noShuffleOptions) exported.shuffle = 0;

    built.push(exported);
  }

  if (built.length < 2) {
    return { error: 'A quiz must contain at least 2 questions' };
  }

  return { data: { questions: built } };
}

const QuizCreatorPage = ({ isDarkMode, setView }) => {
  const [questions, setQuestions] = useState([emptyQuestion(), emptyQuestion()]);
  const [filename, setFilename] = useState('my-quiz');
  const [error, setError] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);

  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const inputBg = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
    : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400';
  const innerBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-600';

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

        <div className={`${cardBg} rounded-2xl shadow-2xl p-6 sm:p-8`}>
          <div className="mb-6">
            <h1 className={`text-3xl font-bold ${textColor} mb-2`}>Quiz Creator</h1>
            <p className={mutedText}>
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
                isDarkMode={isDarkMode}
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

          <div className={`mt-8 p-5 ${innerBg} rounded-xl space-y-4`}>
            <div>
              <label
                htmlFor="quizFilename"
                className={`block text-sm font-medium ${mutedText} mb-1`}
              >
                File name
              </label>
              <input
                id="quizFilename"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className={`w-full px-4 py-2 border-2 ${inputBg} rounded-lg focus:outline-none focus:border-indigo-500`}
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

            <p className={`text-xs ${mutedText}`}>
              Both formats contain the same JSON content. Pick whichever extension you prefer.
            </p>

            {error && (
              <div
                className={`${
                  isDarkMode
                    ? 'bg-red-900 border-red-700 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-700'
                } border px-4 py-3 rounded-lg`}
              >
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full animate-fadeInUp`}>
            <h3 className={`text-xl font-bold ${textColor} mb-4`}>Discard quiz?</h3>
            <p className={`${mutedText} mb-6`}>
              Your unsaved quiz will be lost. Download it first if you want to keep it.
            </p>
            <div className="space-y-3">
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
                className={`w-full px-6 py-3 ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                } rounded-lg font-medium transition-all`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCreatorPage;
