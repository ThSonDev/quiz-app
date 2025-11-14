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

  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const handleAnswerSelect = (optionIndex) => {
    if (isAnswered) return;
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
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
          <h2 className={`text-2xl font-bold ${textColor} mb-6`}>{question.question}</h2>

          <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => {
              let buttonClass = `w-full text-left p-4 rounded-lg border-2 transition-all font-medium `;
              
              if (isAnswered) {
                if (idx === question.correctAnswer) {
                  buttonClass += isDarkMode ? 'bg-green-900 border-green-600 text-green-200' : 'bg-green-100 border-green-500 text-green-800';
                } else if (idx === userAnswer) {
                  buttonClass += isDarkMode ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-100 border-red-500 text-red-800';
                } else {
                  buttonClass += isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-600';
                }
              } else {
                buttonClass += isDarkMode ? 'border-gray-600 hover:border-indigo-500 hover:bg-gray-700 text-gray-200 cursor-pointer' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 text-gray-800 cursor-pointer';
              }

              return (
                <button key={idx} onClick={() => handleAnswerSelect(idx)} disabled={isAnswered} className={buttonClass}>
                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option}
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
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

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
              <button onClick={handleExit} className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all">
                Yes, Exit Quiz
              </button>
              <button onClick={() => setShowExitModal(false)} className={`w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} rounded-lg font-medium transition-all`}>
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
