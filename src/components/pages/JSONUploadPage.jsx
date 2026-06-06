import { useState } from 'react';
import { processQuizData, readQuizFile } from '../../utils/utils.js';
import { sortLibrary, hashQuiz } from '../../utils/storage.js';
import { useQuizLibrary } from '../../hooks/useQuizLibrary';
import { useTheme } from '../../contexts/useTheme';
import QuizLibraryPane from '../ui/QuizLibraryPane';
import Button from '../ui/Button';
import ErrorBanner from '../ui/ErrorBanner';
import { SettingToggle } from '../ui/ToggleSwitch';
import {
  IconUpload,
  IconChevronRight,
  IconPencil,
  IconClose,
  IconDocument,
  IconArrowRight,
} from '../ui/icons';

const JSONUploadPage = ({
  setView,
  setOriginalQuizData,
  setProcessedQuizData,
  setActiveSettings,
  setAnswers,
  setCurrentQuestion,
  uploadedFileInfo,
  setUploadedFileInfo,
  setEditingQuiz,
}) => {
  const { isDarkMode, classes } = useTheme();
  const [error, setError] = useState('');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [quizSize, setQuizSize] = useState('100');
  const [quizSizeMode, setQuizSizeMode] = useState('percentage');
  // Saved-quiz library (localStorage), owned by the hook. The page remounts on
  // each return to upload, so it always reflects fresh storage.
  const { library, saveQuiz, removeFromLibrary, toggleBookmark } = useQuizLibrary();
  const [showLibrary, setShowLibrary] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { data, error: parseError } = await readQuizFile(file);
    if (parseError) {
      setError(parseError);
      setUploadedFileInfo(null);
      return;
    }
    if (data.questions.length < 2) {
      setError('Quiz must contain at least 2 questions');
      setUploadedFileInfo(null);
      return;
    }

    setUploadedFileInfo({
      file: file,
      name: file.name,
      questionCount: data.questions.length,
      rawData: data,
    });
    setOriginalQuizData(data);
    setError('');

    // Persist to the library (dedupes identical content by bumping time).
    saveQuiz(data, file.name);
  };

  const handleRemoveFile = () => {
    setUploadedFileInfo(null);
    setOriginalQuizData(null);
    setError('');
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // Load a saved quiz into the normal flow: it populates uploadedFileInfo so the
  // existing settings card + Start button work unchanged (no File object needed).
  const selectFromLibrary = (entry) => {
    setUploadedFileInfo({
      name: entry.name,
      questionCount: entry.questionCount,
      rawData: entry.rawData,
    });
    setOriginalQuizData(entry.rawData);
    setError('');
    setShowLibrary(false);
  };

  // Open the loaded quiz in the creator for editing (reuses view === 'create').
  const editCurrentQuiz = () => {
    const id = hashQuiz(uploadedFileInfo.rawData);
    const entry = library.find((e) => e.id === id);
    setEditingQuiz({
      id,
      name: uploadedFileInfo.name,
      bookmarked: entry?.bookmarked ?? false,
      rawData: uploadedFileInfo.rawData,
    });
    setView('create');
  };

  const handleQuizSizeChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setQuizSize('');
      return;
    }
    if (!/^\d+$/.test(value)) return;

    const numValue = parseInt(value);
    if (quizSizeMode === 'percentage' && numValue > 100) {
      setQuizSize('100');
      return;
    }
    setQuizSize(value);
  };

  const startQuiz = () => {
    const sizeValue = quizSize.trim();

    if (sizeValue === '') {
      setError('Please enter a quiz size value');
      return;
    }

    const parsedSize = parseInt(sizeValue);
    if (isNaN(parsedSize)) {
      setError('Quiz size must be a valid number');
      return;
    }

    if (quizSizeMode === 'percentage') {
      if (parsedSize < 10 || parsedSize > 100) {
        setError('Quiz Size must be between 10% and 100%');
        return;
      }
    } else {
      if (parsedSize < 2) {
        setError('Quiz must have at least 2 questions');
        return;
      }
      if (parsedSize > uploadedFileInfo.questionCount) {
        setError(`Question count cannot exceed ${uploadedFileInfo.questionCount}`);
        return;
      }
    }

    const currentSettings = { shuffleQuestions, shuffleOptions, quizSize: parsedSize, quizSizeMode };

    setActiveSettings(currentSettings);
    setAnswers({});
    setCurrentQuestion(0);
    setError('');

    const processedData = processQuizData(uploadedFileInfo.rawData, currentSettings);
    setProcessedQuizData(processedData);
    setView('quiz');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`${classes.cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300`}>
        <div className="text-center mb-8">
          <div className={`${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <IconUpload className={`w-10 h-10 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
          <h1 className={`text-3xl font-bold ${classes.textColor} mb-2`}>Quiz Application</h1>
          <p className={classes.mutedText}>Upload a JSON or TXT file to start your quiz</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <SettingToggle
              label="Shuffle Questions"
              description="Randomize question order"
              checked={shuffleQuestions}
              onChange={() => setShuffleQuestions(!shuffleQuestions)}
            />
            <SettingToggle
              label="Shuffle Options"
              description="Randomize answer choices"
              checked={shuffleOptions}
              onChange={() => setShuffleOptions(!shuffleOptions)}
            />
          </div>

          <div className={`p-4 ${classes.inputBgPlain} rounded-lg space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <label htmlFor="quizSize" className={`font-medium ${classes.textColor} block`}>Quiz Size</label>
                <p className={`text-sm ${classes.mutedText} break-words`}>
                  {quizSizeMode === 'percentage' ? 'Take a percentage of questions' : 'Specify exact number of questions'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setQuizSizeMode('percentage')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    quizSizeMode === 'percentage'
                      ? 'bg-indigo-600 text-white'
                      : `${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'}`
                  }`}
                  title="Percentage (%)"
                >
                  %
                </button>
                <button
                  onClick={() => setQuizSizeMode('count')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    quizSizeMode === 'count'
                      ? 'bg-indigo-600 text-white'
                      : `${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'}`
                  }`}
                  title="Number (#)"
                >
                  #
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="quizSize"
                type="text"
                inputMode="numeric"
                value={quizSize}
                onChange={handleQuizSizeChange}
                placeholder={quizSizeMode === 'percentage' ? '100' : '10'}
                className={`flex-1 min-w-0 px-4 py-2 border-2 ${
                  isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800'
                } rounded-lg font-semibold focus:outline-none focus:border-indigo-500`}
              />
              <span className={`${classes.mutedText} font-medium whitespace-nowrap flex-shrink-0`}>
                {quizSizeMode === 'percentage' ? '%' : 'questions'}
              </span>
            </div>
          </div>

          {library.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLibrary(true)}
              className={`w-full flex items-center justify-between px-4 py-3 ${classes.inputBgPlain} border-2 rounded-lg hover:border-indigo-500 transition-colors`}
              title="Choose a previously uploaded quiz"
            >
              <span className={`font-medium ${classes.textColor}`}>
                Choose a Saved Quiz
                <span className={`ml-2 text-sm ${classes.mutedText}`}>({library.length})</span>
              </span>
              <IconChevronRight className={`w-5 h-5 ${classes.mutedText}`} />
            </button>
          )}

          {!uploadedFileInfo ? (
            <label className="block">
              <div className={`border-2 border-dashed ${isDarkMode ? 'border-indigo-500' : 'border-indigo-300'} rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer`}>
                <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" />
                <IconUpload className={`w-12 h-12 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-400'} mx-auto mb-2`} />
                <p className={`${classes.textColor} font-medium`}>Click to upload JSON or TXT file</p>
                <p className={`${classes.mutedText} text-sm mt-1`}>or drag and drop</p>
                <p className={`${classes.mutedText} text-xs mt-2`}>Supported formats: .json, .txt</p>
              </div>
            </label>
          ) : (
            <div className={`relative border-2 ${isDarkMode ? 'border-green-600 bg-green-900' : 'border-green-300 bg-green-50'} rounded-lg p-6`}>
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  onClick={editCurrentQuiz}
                  className={`p-1.5 rounded-full transition-all ${
                    isDarkMode
                      ? 'hover:bg-indigo-800 text-indigo-300 hover:text-indigo-200'
                      : 'hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700'
                  }`}
                  aria-label="Edit quiz"
                  title="Edit questions"
                >
                  <IconPencil className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRemoveFile}
                  className={`p-1.5 rounded-full transition-all ${
                    isDarkMode
                      ? 'hover:bg-red-800 text-red-400 hover:text-red-300'
                      : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                  }`}
                  aria-label="Remove file"
                  title="Remove file"
                >
                  <IconClose className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-start gap-4 pr-16">
                <div className={`${isDarkMode ? 'bg-green-800' : 'bg-green-100'} p-3 rounded-lg flex-shrink-0`}>
                  <IconDocument className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${classes.textColor} mb-1 break-words`}>{uploadedFileInfo.name}</p>
                  <p className={`${classes.mutedText} text-sm`}>{uploadedFileInfo.questionCount} questions loaded</p>
                </div>
              </div>

              <Button
                onClick={startQuiz}
                className="w-full mt-4 flex items-center justify-center gap-2"
                title="Start Quiz"
              >
                Start Quiz
                <IconArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          <ErrorBanner>{error}</ErrorBanner>
        </div>

        <div className={`mt-6 p-4 ${classes.inputBgPlain} rounded-lg`}>
          <p className={`text-sm ${classes.mutedText} font-medium mb-2`}>Expected JSON format:</p>
          <pre className={`text-xs ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'} p-2 rounded border overflow-x-auto`}>
{`{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why A is correct",
      "shuffle": 0
    }
  ]
}
`}
          </pre>
          <div className={`text-sm ${classes.mutedText} font-medium mt-2 space-y-1`}>
            <p>Note:</p>
            <p>Both .json and .txt are accepted; the file must contain valid quiz JSON.</p>
            <p>"explanation" and "shuffle" are optional.</p>
            <p>"shuffle": 0 prevents option shuffling for that specific question.</p>
            <p>"correctAnswer" can be a number (single choice) or an array of indices (multiple choice).</p>
          </div>
        </div>

        <div className={`mt-6 p-4 ${classes.inputBgPlain} rounded-lg`}>
          <p className={`text-sm ${classes.mutedText} mb-3 text-center`}>Don't have a quiz file yet?</p>
          <Button
            variant="purple"
            onClick={() => {
              setEditingQuiz(null);
              setView('create');
            }}
            className="w-full"
            title="Create your own quiz"
          >
            Create Your Own Quiz
          </Button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://github.com/ThSonDev/quiz-app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            View on GitHub
          </a>
        </div>
      </div>

      {showLibrary && (
        <QuizLibraryPane
          entries={sortLibrary(library)}
          onSelect={selectFromLibrary}
          onToggleBookmark={toggleBookmark}
          onRemove={removeFromLibrary}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
};

export default JSONUploadPage;
