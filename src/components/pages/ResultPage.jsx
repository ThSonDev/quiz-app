import React, { useState, useEffect } from 'react';

const ResultPage = ({
  isDarkMode,
  quizData,
  originalQuizData,
  answers,
  setAnswers,
  activeSettings,
  setCurrentQuestion,
  setProcessedQuizData,
  setView,
  setOriginalQuizData
}) => {
  const [showRetryModal, setShowRetryModal] = useState(false);

  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const calculateResults = () => {
    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    const incorrect = quizData.questions.length - correct;
    const score = (correct / quizData.questions.length) * 10;
    return { correct, incorrect, score: score.toFixed(2) };
  };

  const { correct, incorrect, score } = calculateResults();
  const showPercentage = activeSettings.quizSizeMode === 'percentage' && activeSettings.quizSize < 100;

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const processQuizData = (data, settings) => {
    let processedQuestions = data.questions.map((q, idx) => ({ ...q, originalIndex: idx }));

    if (settings.shuffleQuestions) {
      processedQuestions = shuffleArray(processedQuestions);
    }

    if (settings.quizSizeMode === 'percentage' && settings.quizSize < 100) {
      const targetCount = Math.max(1, Math.ceil((settings.quizSize / 100) * processedQuestions.length));
      processedQuestions = processedQuestions.slice(0, targetCount);
    } else if (settings.quizSizeMode === 'count') {
      processedQuestions = processedQuestions.slice(0, settings.quizSize);
    }

    processedQuestions = processedQuestions.map(q => {
      const shouldShuffle = settings.shuffleOptions && q.shuffle !== 0;
      if (!shouldShuffle) return q;

      const optionsWithIndices = q.options.map((opt, idx) => ({ option: opt, originalIndex: idx }));
      const shuffledOptions = shuffleArray(optionsWithIndices);
      const newCorrectIndex = shuffledOptions.findIndex(item => item.originalIndex === q.correctAnswer);

      return {
        ...q,
        options: shuffledOptions.map(item => item.option),
        correctAnswer: newCorrectIndex
      };
    });

    return { ...data, questions: processedQuestions };
  };

  const handleRetry = () => {
    const hasShuffleActive = activeSettings.shuffleQuestions || activeSettings.shuffleOptions;
    if (hasShuffleActive) {
      setShowRetryModal(true);
    } else {
      retrySameLayout();
    }
  };

  const retrySameLayout = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowRetryModal(false);
    setView('quiz');
  };

  const retryNewShuffle = () => {
    setAnswers({});
    setCurrentQuestion(0);
    const processedData = processQuizData(originalQuizData, activeSettings);
    setProcessedQuizData(processedData);
    setShowRetryModal(false);
    setView('quiz');
  };

  const handleFinish = () => {
    setOriginalQuizData(null);
    setProcessedQuizData(null);
    setAnswers({});
    setCurrentQuestion(0);
    setView('upload');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full`}>
        <div className="text-center mb-8">
          <div className={`${isDarkMode ? 'bg-green-900' : 'bg-green-100'} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className={`text-4xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{score}</span>
          </div>
          <h2 className={`text-3xl font-bold ${textColor} mb-2`}>
            Quiz Complete!{showPercentage && ` (${activeSettings.quizSize}%)`}
          </h2>
          <p className={mutedText}>Here are your results</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-green-900' : 'bg-green-50'} rounded-lg`}>
            <span className={`font-medium ${mutedText}`}>Correct Answers</span>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{correct}</span>
          </div>
          <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-red-900' : 'bg-red-50'} rounded-lg`}>
            <span className={`font-medium ${mutedText}`}>Incorrect Answers</span>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{incorrect}</span>
          </div>
          <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-50'} rounded-lg`}>
            <span className={`font-medium ${mutedText}`}>Final Score (out of 10)</span>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{score}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setView('review')}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Review Answers
          </button>
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Quiz
          </button>
          <button
            onClick={handleFinish}
            className={`w-full flex items-center justify-center px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg font-medium transition-all`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Finish
          </button>
        </div>
      </div>

      {/* Retry Modal */}
      {showRetryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full animate-fadeInUp`}>
            <h3 className={`text-xl font-bold ${textColor} mb-4`}>Retry Quiz</h3>
            <p className={`${mutedText} mb-6`}>Choose how you want to retry the quiz:</p>
            <div className="space-y-3">
              <button onClick={retrySameLayout} className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all">
                Same Layout
                <span className="block text-sm text-indigo-200 mt-1">Keep the same question and option order</span>
              </button>
              <button onClick={retryNewShuffle} className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all">
                New Shuffle
                <span className="block text-sm text-purple-200 mt-1">Randomize questions and options again</span>
              </button>
              <button onClick={() => setShowRetryModal(false)} className={`w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} rounded-lg font-medium transition-all`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ResultPage;
