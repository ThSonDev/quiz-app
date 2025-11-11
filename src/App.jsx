import React, { useState } from 'react';
import { Upload, ArrowRight, ArrowLeft, RotateCcw, X, Eye, FileText } from 'lucide-react';

// Quiz state management
const QuizApp = () => {
  const [view, setView] = useState('upload'); // upload, quiz, results, review
  const [quizData, setQuizData] = useState(null);
  const [originalQuizData, setOriginalQuizData] = useState(null); // Store original unprocessed data
  const [uploadedFile, setUploadedFile] = useState(null); // Store uploaded file info
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [quizSize, setQuizSize] = useState('100');
  const [quizSizeMode, setQuizSizeMode] = useState('percentage'); // 'percentage' or 'count'
  // Store settings used when quiz started
  const [activeSettings, setActiveSettings] = useState({
    shuffleQuestions: false,
    shuffleOptions: false,
    quizSize: 100
  });

  // Shuffle array utility
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Process quiz data with shuffling
  const processQuizData = (data, settings) => {
    let processedQuestions = data.questions.map((q, idx) => ({
      ...q,
      originalIndex: idx
    }));

    // Shuffle questions if enabled
    if (settings.shuffleQuestions) {
      processedQuestions = shuffleArray(processedQuestions);
    }

    // Apply quiz size (percentage or count)
    if (settings.quizSizeMode === 'percentage' && settings.quizSize < 100) {
      const targetCount = Math.max(1, Math.ceil((settings.quizSize / 100) * processedQuestions.length));
      processedQuestions = processedQuestions.slice(0, targetCount);
    } else if (settings.quizSizeMode === 'count') {
      processedQuestions = processedQuestions.slice(0, settings.quizSize);
    }

    // Shuffle options per question
    processedQuestions = processedQuestions.map(q => {
      // Check if this question should have options shuffled
      const shouldShuffle = settings.shuffleOptions && q.shuffle !== 0;
      
      if (!shouldShuffle) {
        return q;
      }

      // Create array of [option, index] pairs
      const optionsWithIndices = q.options.map((opt, idx) => ({ option: opt, originalIndex: idx }));
      const shuffledOptions = shuffleArray(optionsWithIndices);

      // Find new position of correct answer
      const newCorrectIndex = shuffledOptions.findIndex(
        item => item.originalIndex === q.correctAnswer
      );

      return {
        ...q,
        options: shuffledOptions.map(item => item.option),
        correctAnswer: newCorrectIndex
      };
    });

    return { ...data, questions: processedQuestions };
  };

  // Validate JSON structure
  const validateQuizData = (data) => {
    if (!data.questions || !Array.isArray(data.questions)) {
      return 'Invalid format: missing "questions" array';
    }
    
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      if (!q.question || !q.options || !Array.isArray(q.options) || 
          q.correctAnswer === undefined) {
        return `Invalid question format at index ${i}`;
      }
      if (q.options.length < 2) {
        return `Question ${i} must have at least 2 options`;
      }
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        return `Invalid correctAnswer index for question ${i}`;
      }
    }
    return null;
  };

  // Handle file upload
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

        // Validate minimum questions
        if (data.questions.length < 2) {
          setError('Quiz must contain at least 2 questions');
          setUploadedFile(null);
          return;
        }

        // Store uploaded file info and original data
        setUploadedFile({
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

  // Start quiz after validation
  const startQuiz = () => {
    if (!originalQuizData) return;

    // Parse and validate quiz size
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
      // Percentage mode validation
      if (parsedSize < 10 || parsedSize > 100) {
        setError('Quiz Size must be between 10% and 100%');
        return;
      }
    } else {
      // Question count mode validation
      if (parsedSize < 2) {
        setError('Quiz must have at least 2 questions');
        return;
      }
      if (parsedSize > originalQuizData.questions.length) {
        setError(`Question count cannot exceed ${originalQuizData.questions.length} (total available questions)`);
        return;
      }
    }

    // Store active settings
    const currentSettings = {
      shuffleQuestions,
      shuffleOptions,
      quizSize: parsedSize,
      quizSizeMode
    };
    setActiveSettings(currentSettings);

    setAnswers({});
    setCurrentQuestion(0);
    setError('');
    
    // Process quiz data with shuffle settings
    const processedData = processQuizData(originalQuizData, currentSettings);
    setQuizData(processedData);
    setView('quiz');
  };

  // Handle answer selection
  const handleAnswerSelect = (optionIndex) => {
    if (answers[currentQuestion] !== undefined) return; // Already answered
    
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex
    });
  };

  // Handle quiz size input change
  const handleQuizSizeChange = (e) => {
    const value = e.target.value;
    
    // Allow empty input while typing
    if (value === '') {
      setQuizSize('');
      return;
    }
    
    // Only allow numeric input
    if (!/^\d+$/.test(value)) {
      return;
    }
    
    const numValue = parseInt(value);
    
    // Auto-clamp to 100 if in percentage mode and value exceeds 100
    if (quizSizeMode === 'percentage' && numValue > 100) {
      setQuizSize('100');
      return;
    }
    
    setQuizSize(value);
  };

  // Navigation
  const goToNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (Object.keys(answers).length === quizData.questions.length) {
      setView('results');
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Calculate results
  const calculateResults = () => {
    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    
    const incorrect = quizData.questions.length - correct;
    const score = (correct / quizData.questions.length) * 10;
    
    return { correct, incorrect, score: score.toFixed(2) };
  };

  // Reset quiz
  const resetQuiz = () => {
    // Use the original quiz data and active settings from when quiz started
    setAnswers({});
    setCurrentQuestion(0);
    
    // Re-process with the same settings that were used initially
    const processedData = processQuizData(originalQuizData, activeSettings);
    setQuizData(processedData);
    setView('quiz');
  };

  // Return to upload
  const finishQuiz = () => {
    setQuizData(null);
    setOriginalQuizData(null);
    setUploadedFile(null);
    setAnswers({});
    setCurrentQuestion(0);
    setError('');
    setView('upload');
  };

  // Render upload view
  const renderUpload = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Application</h1>
          <p className="text-gray-600">Upload a JSON file to start your quiz</p>
        </div>

        <div className="space-y-4">
          {/* Shuffle toggles */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Shuffle Questions</p>
                <p className="text-sm text-gray-600">Randomize question order</p>
              </div>
              <button
                onClick={() => setShuffleQuestions(!shuffleQuestions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  shuffleQuestions ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    shuffleQuestions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Shuffle Options</p>
                <p className="text-sm text-gray-600">Randomize answer choices</p>
              </div>
              <button
                onClick={() => setShuffleOptions(!shuffleOptions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  shuffleOptions ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    shuffleOptions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quiz Size input */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <label htmlFor="quizSize" className="font-medium text-gray-800 block">
                  Quiz Size
                </label>
                <p className="text-sm text-gray-600">
                  {quizSizeMode === 'percentage' 
                    ? 'Take a percentage of questions (50 = half)'
                    : 'Specify exact number of questions to attempt'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuizSizeMode('percentage')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    quizSizeMode === 'percentage'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => setQuizSizeMode('count')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    quizSizeMode === 'count'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
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
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-gray-600 font-medium">
                {quizSizeMode === 'percentage' ? '%' : 'questions'}
              </span>
            </div>
          </div>

          {/* File upload or uploaded file display */}
          {!uploadedFile ? (
            <label className="block">
              <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                <p className="text-gray-700 font-medium">Click to upload JSON file</p>
                <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
              </div>
            </label>
          ) : (
            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-1">{uploadedFile.name}</p>
                  <p className="text-gray-600 text-sm">
                    {uploadedFile.questionCount} questions loaded
                  </p>
                </div>
              </div>
              <button
                onClick={startQuiz}
                className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Start Quiz
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-medium mb-2">Expected JSON format:</p>
          <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
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

Note: "shuffle": 0 prevents option 
shuffling for that specific question`}
          </pre>
        </div>
      </div>
    </div>
  );

  // Render quiz view
  const renderQuiz = () => {
    const question = quizData.questions[currentQuestion];
    const userAnswer = answers[currentQuestion];
    const isAnswered = userAnswer !== undefined;
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quizData.questions.length;
    const progressPercent = (answeredCount / totalQuestions) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-3xl mx-auto py-8">
          {/* Progress bar */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {answeredCount} / {totalQuestions}
              </span>
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestion + 1}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {question.options.map((option, idx) => {
                let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all font-medium ";
                
                if (isAnswered) {
                  if (idx === question.correctAnswer) {
                    buttonClass += "bg-green-100 border-green-500 text-green-800";
                  } else if (idx === userAnswer) {
                    buttonClass += "bg-red-100 border-red-500 text-red-800";
                  } else {
                    buttonClass += "bg-gray-50 border-gray-300 text-gray-600";
                  }
                } else {
                  buttonClass += "border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 text-gray-800 cursor-pointer";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    disabled={isAnswered}
                    className={buttonClass}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswered && question.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-1">Explanation:</p>
                <p className="text-blue-800">{question.explanation}</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  currentQuestion === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              <button
                onClick={goToNext}
                disabled={!isAnswered}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  !isAnswered
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {currentQuestion === totalQuestions - 1 && answeredCount === totalQuestions
                  ? 'Finish'
                  : 'Next'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render results view
  const renderResults = () => {
    const { correct, incorrect, score } = calculateResults();
    const showPercentage = activeSettings.quizSizeMode === 'percentage' && activeSettings.quizSize < 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-green-600">{score}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Quiz Complete!{showPercentage && ` (${activeSettings.quizSize}%)`}
            </h2>
            <p className="text-gray-600">Here are your results</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-700">Correct Answers</span>
              <span className="text-2xl font-bold text-green-600">{correct}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-700">Incorrect Answers</span>
              <span className="text-2xl font-bold text-red-600">{incorrect}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
              <span className="font-medium text-gray-700">Final Score (out of 10)</span>
              <span className="text-2xl font-bold text-indigo-600">{score}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setView('review')}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              <Eye className="w-5 h-5 mr-2" />
              Review Answers
            </button>
            <button
              onClick={resetQuiz}
              className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retry Quiz
            </button>
            <button
              onClick={finishQuiz}
              className="w-full flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
            >
              <X className="w-5 h-5 mr-2" />
              Finish
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render review view
  const renderReview = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          {/* Sticky header with back button */}
          <div className="sticky top-4 z-10 mb-6">
            <button
              onClick={() => setView('results')}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg"
            >
              ← Back to Results
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Review All Answers</h2>
            <p className="text-gray-600">See all questions, correct answers, and explanations</p>
          </div>

          <div className="space-y-6">
            {quizData.questions.map((question, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex-1">
                      {idx + 1}. {question.question}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIdx) => {
                      let optionClass = "p-3 rounded-lg border-2 ";
                      
                      if (optIdx === question.correctAnswer) {
                        optionClass += "bg-green-50 border-green-500";
                      } else if (optIdx === userAnswer && !isCorrect) {
                        optionClass += "bg-red-50 border-red-500";
                      } else {
                        optionClass += "bg-gray-50 border-gray-200";
                      }

                      return (
                        <div key={optIdx} className={optionClass}>
                          <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                          {option}
                          {optIdx === question.correctAnswer && (
                            <span className="ml-2 text-green-700 font-medium">✓ Correct</span>
                          )}
                          {optIdx === userAnswer && !isCorrect && (
                            <span className="ml-2 text-red-700 font-medium">✗ Your answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-900 mb-1">Explanation:</p>
                    <p className="text-blue-800">{question.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div>
      {view === 'upload' && renderUpload()}
      {view === 'quiz' && renderQuiz()}
      {view === 'results' && renderResults()}
      {view === 'review' && renderReview()}
    </div>
  );
};

export default QuizApp;