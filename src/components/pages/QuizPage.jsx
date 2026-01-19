import { useState, useEffect } from 'react';

const QuizPage = ({
  isDarkMode,
  quizData,
  answers,
  setAnswers,
  currentQuestion,
  setCurrentQuestion,
  setView
}) => {
  const [showExitModal, setShowExitModal] = useState(false);

  const question = quizData.questions[currentQuestion];
  const userAnswer = answers[currentQuestion];
  const isAnswered = userAnswer !== undefined;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quizData.questions.length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  const [multiSelection, setMultiSelection] = useState([]);
  const isMultiChoice = Array.isArray(question.correctAnswer) && question.correctAnswer.length > 1;

  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  useEffect(() => {
    setMultiSelection([]);
  }, [currentQuestion]);

  const handleAnswerSelect = (optionIndex) => {
    if (isAnswered) return;

    if (isMultiChoice) {
      setMultiSelection(prev => {
        if (prev.includes(optionIndex)) {
          return prev.filter(i => i !== optionIndex);
        }
        return [...prev, optionIndex];
      });
    } else {
      setAnswers({ ...answers, [currentQuestion]: optionIndex });
    }
  };

  const handleConfirmMulti = () => {
    // Sort indices to ensure consistent comparison later
    const sortedSelection = [...multiSelection].sort((a, b) => a - b);
    setAnswers({ ...answers, [currentQuestion]: sortedSelection });
  };

  const goToNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (answeredCount === totalQuestions) {
      setView('results');
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleExit = () => {
    setView('upload');
    setShowExitModal(false);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-4">
          <button
            onClick={() => setShowExitModal(true)}
            className={`flex items-center px-4 py-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-600'} text-white rounded-lg font-medium hover:bg-gray-700 transition-all`}
            title="Return to Upload"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Upload
          </button>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${mutedText}`}>Progress: {answeredCount} / {totalQuestions}</span>
            <span className={`text-sm font-medium ${mutedText}`}>Question {currentQuestion + 1}</span>
          </div>
          <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-8`}>
          {isMultiChoice && (
            <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Multiple Choices
            </p>
          )}
          <h2 className={`text-2xl font-bold ${textColor} mb-6`}>{question.question}</h2>

          <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => {
              // 1. Determine State
              const isSelected = isAnswered 
                              ? (Array.isArray(userAnswer) ? userAnswer.includes(idx) : userAnswer === idx)
                              : (isMultiChoice ? multiSelection.includes(idx) : false);

              const isCorrectOption = Array.isArray(question.correctAnswer) 
                    ? question.correctAnswer.includes(idx) 
                    : question.correctAnswer === idx;

              // 2. Base Classes
              let buttonClass = `w-full text-left p-4 rounded-lg border-2 transition-all font-medium relative overflow-hidden `;

              // 3. Conditional Styling
              if (isAnswered) {
                if (isSelected && isCorrectOption) {
                  // Case: User Selected CORRECT Answer
                  buttonClass += isDarkMode 
                    ? 'bg-green-900/50 border-green-500 text-green-100' 
                    : 'bg-green-100 border-green-500 text-green-900';
                } else if (isSelected && !isCorrectOption) {
                  // Case: User Selected WRONG Answer
                  buttonClass += isDarkMode 
                    ? 'bg-red-900/50 border-red-500 text-red-100' 
                    : 'bg-red-100 border-red-500 text-red-900';
                } else if (!isSelected && isCorrectOption) {
                  // Case: Correct Answer but UNCHOSEN
                  buttonClass += isDarkMode 
                    ? 'bg-green-900/30 border-green-500 border-dashed text-green-200' 
                    : 'bg-green-50 border-green-500 border-dashed text-green-800';
                } else {
                  // Case: Wrong and Unselected (Neutral)
                  buttonClass += isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-500 opacity-50' : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50';
                }
              } else {
                // Interactive State
                if (isSelected) {
                   // MODIFIED: Blue Glow for selected state before confirming
                   buttonClass += isDarkMode 
                     ? 'border-blue-400 bg-blue-900/40 text-blue-100 ring-2 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                     : 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400/50 shadow-md';
                } else {
                   buttonClass += isDarkMode 
                     ? 'border-gray-600 hover:border-gray-400 hover:bg-gray-700 text-gray-200' 
                     : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50 text-gray-800';
                }
                buttonClass += ' cursor-pointer';
              }

              return (
                <button key={idx} onClick={() => handleAnswerSelect(idx)} disabled={isAnswered} className={buttonClass}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-bold mr-3 opacity-70">{String.fromCharCode(65 + idx)}.</span>
                      <span>{option}</span>
                    </div>
                    
                    {/* MODIFIED: Status Icons and Text for Result State */}
                    {isAnswered && (
                      <div className="flex items-center text-sm font-bold ml-4 shrink-0">
                         {isSelected && isCorrectOption && (
                           <div className="flex items-center text-green-600 dark:text-green-400">
                             <span className="mr-1">Correct</span>
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           </div>
                         )}
                         {isSelected && !isCorrectOption && (
                           <div className="flex items-center text-red-600 dark:text-red-400">
                             <span className="mr-1">Your answer</span>
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                           </div>
                         )}
                         {!isSelected && isCorrectOption && (
                           <div className="flex items-center text-red-500 dark:text-red-400">
                              <span className="mr-1">Unchosen</span>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && question.explanation && (
            <div className={`${isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
              <p className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-1`}>Explanation:</p>
              <p className={isDarkMode ? 'text-blue-200' : 'text-blue-800'}>{question.explanation}</p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                currentQuestion === 0
                  ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                  : `${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`
              }`}
              title="Previous question"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {isMultiChoice && !isAnswered ? (
               <button
                 onClick={handleConfirmMulti}
                 disabled={multiSelection.length === 0}
                 className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                   multiSelection.length === 0
                   ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                   : 'bg-green-600 text-white hover:bg-green-700'
                 }`}
               >
                 Confirm
               </button>
            ) : (
              <button
                onClick={goToNext}
                disabled={!isAnswered}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  !isAnswered
                    ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {currentQuestion === totalQuestions - 1 && answeredCount === totalQuestions ? 'Finish' : 'Next'}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full animate-fadeInUp`}>
            <h3 className={`text-xl font-bold ${textColor} mb-4`}>Exit Quiz?</h3>
            <p className={`${mutedText} mb-6`}>Are you sure you want to exit? Your progress will be lost.</p>
            <div className="space-y-3">
              <button onClick={handleExit} className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all" title="Exit">
                Yes, Exit Quiz
              </button>
              <button onClick={() => setShowExitModal(false)} className={`w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} rounded-lg font-medium transition-all`} title="Don't exit">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
