import { useState, useEffect } from 'react';
import { shuffleArray, validateQuizData, processQuizData } from "../../utils/upload.js";

const JSONUploadPage = ({
  isDarkMode,
  setView,
  setOriginalQuizData,
  setProcessedQuizData,
  setActiveSettings,
  setAnswers,
  setCurrentQuestion
}) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [quizSize, setQuizSize] = useState('100');
  const [quizSizeMode, setQuizSizeMode] = useState('percentage');

  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const inputBg = isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const validationError = validateQuizData(data);
        
        if (validationError) {
          setError(validationError);
          setUploadedFile(null);
          return;
        }

        if (data.questions.length < 2) {
          setError('Quiz must contain at least 2 questions');
          setUploadedFile(null);
          return;
        }

        setUploadedFile({
          file, // <— QUAN TRỌNG: lưu cả file thật
          name: file.name,
          questionCount: data.questions.length
        });
        setOriginalQuizData(data);
        setError('');
      } catch (err) {
        setError('Invalid JSON file format');
        setUploadedFile(null);
      }
    };
    reader.readAsText(file);
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

    if (sizeValue === "") {
      setError("Please enter a quiz size value");
      return;
    }

    const parsedSize = parseInt(sizeValue);
    if (isNaN(parsedSize)) {
      setError("Quiz size must be a valid number");
      return;
    }

    if (quizSizeMode === "percentage") {
      if (parsedSize < 10 || parsedSize > 100) {
        setError("Quiz Size must be between 10% and 100%");
        return;
      }
    } else {
      if (parsedSize < 2) {
        setError("Quiz must have at least 2 questions");
        return;
      }
      if (parsedSize > uploadedFile.questionCount) {
        setError(
          `Question count cannot exceed ${uploadedFile.questionCount}`
        );
        return;
      }
    }

    const currentSettings = {
      shuffleQuestions,
      shuffleOptions,
      quizSize: parsedSize,
      quizSizeMode,
    };

    setActiveSettings(currentSettings);
    setAnswers({});
    setCurrentQuestion(0);
    setError("");

    if (!uploadedFile?.file) {
      setError("Please upload a valid file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const processedData = processQuizData(data, currentSettings);
        setProcessedQuizData(processedData);
        setView("quiz");
      } catch (e) {
        setError("Invalid JSON structure");
      }
    };

    reader.readAsText(uploadedFile.file);
  };


  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300`}>
        <div className="text-center mb-8">
          <div className={`${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className={`w-10 h-10 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold ${textColor} mb-2`}>Quiz Application</h1>
          <p className={mutedText}>Upload a JSON file to start your quiz</p>
        </div>

        <div className="space-y-4">
          {/* Shuffle toggles */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-4 ${inputBg} rounded-lg`}>
              <div>
                <p className={`font-medium ${textColor}`}>Shuffle Questions</p>
                <p className={`text-sm ${mutedText}`}>Randomize question order</p>
              </div>
              <button
                onClick={() => setShuffleQuestions(!shuffleQuestions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  shuffleQuestions ? 'bg-indigo-600' : 'bg-gray-400'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shuffleQuestions ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className={`flex items-center justify-between p-4 ${inputBg} rounded-lg`}>
              <div>
                <p className={`font-medium ${textColor}`}>Shuffle Options</p>
                <p className={`text-sm ${mutedText}`}>Randomize answer choices</p>
              </div>
              <button
                onClick={() => setShuffleOptions(!shuffleOptions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  shuffleOptions ? 'bg-indigo-600' : 'bg-gray-400'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shuffleOptions ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Quiz Size */}
          <div className={`p-4 ${inputBg} rounded-lg`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <label htmlFor="quizSize" className={`font-medium ${textColor} block`}>Quiz Size</label>
                <p className={`text-sm ${mutedText}`}>
                  {quizSizeMode === 'percentage' ? 'Take a percentage of questions' : 'Specify exact number of questions'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuizSizeMode('percentage')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    quizSizeMode === 'percentage' ? 'bg-indigo-600 text-white' : `${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'}`
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => setQuizSizeMode('count')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    quizSizeMode === 'count' ? 'bg-indigo-600 text-white' : `${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'}`
                  }`}
                >
                  #
                </button>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <input
                id="quizSize"
                type="text"
                inputMode="numeric"
                value={quizSize}
                onChange={handleQuizSizeChange}
                placeholder={quizSizeMode === 'percentage' ? '100' : '10'}
                className={`flex-1 px-4 py-2 border-2 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800'} rounded-lg font-semibold focus:outline-none focus:border-indigo-500`}
              />
              <span className={`${mutedText} font-medium`}>
                {quizSizeMode === 'percentage' ? '%' : 'questions'}
              </span>
            </div>
          </div>

          {/* File upload */}
          {!uploadedFile ? (
            <label className="block">
              <div className={`border-2 border-dashed ${isDarkMode ? 'border-indigo-500' : 'border-indigo-300'} rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer`}>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                <svg className={`w-12 h-12 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-400'} mx-auto mb-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className={`${textColor} font-medium`}>Click to upload JSON file</p>
                <p className={`${mutedText} text-sm mt-1`}>or drag and drop</p>
              </div>
            </label>
          ) : (
            <div className={`border-2 ${isDarkMode ? 'border-green-600 bg-green-900' : 'border-green-300 bg-green-50'} rounded-lg p-6`}>
              <div className="flex items-start gap-4">
                <div className={`${isDarkMode ? 'bg-green-800' : 'bg-green-100'} p-3 rounded-lg`}>
                  <svg className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${textColor} mb-1`}>{uploadedFile.name}</p>
                  <p className={`${mutedText} text-sm`}>{uploadedFile.questionCount} questions loaded</p>
                </div>
              </div>
              <button
                onClick={startQuiz}
                className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Start Quiz
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}

          {error && (
            <div className={`${isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg`}>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className={`mt-6 p-4 ${inputBg} rounded-lg`}>
          <p className={`text-sm ${mutedText} font-medium mb-2`}>Expected JSON format:</p>
          <pre className={`text-xs ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'} p-2 rounded border overflow-x-auto`}>
{`{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why A is correct (Optional)",
      "shuffle": 0
    }
  ]
}

Note: "shuffle": 0 prevents option shuffling
for that specific question`}
          </pre>
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
    </div>
  );
};

export default JSONUploadPage;
