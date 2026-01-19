import { useState, useEffect } from 'react';
import { processQuizData, calculateQuestionScore } from '../../utils/utils';

const ResultPage = ({
  isDarkMode,
  quizData,
  originalQuizData,
  answers,
  setAnswers,
  activeSettings,
  setCurrentQuestion,
  setProcessedQuizData,
  setView
}) => {
  const [showRetryModal, setShowRetryModal] = useState(false);

  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const hasMultiChoice = quizData.questions.some(q => Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1);

  const calculateResults = () => {
    let totalPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let partialCount = 0;
    // Note: Questions with 0 < Score < 1 are "partial" and contribute to totalPoints but are not strictly "Correct" or "Incorrect" in the binary counts.

    quizData.questions.forEach((q, idx) => {
      const userAns = answers[idx];
      const qScore = calculateQuestionScore(q, userAns);
      
      totalPoints += qScore;

      if (qScore === 1) {
        correctCount++;
      } else if (qScore === 0) {
        incorrectCount++;
      } else {
        partialCount++;
      }
    });

    // Final Score Calculation (out of 10)
    // Formula: (TotalPoints / TotalQuestions) * 10
    const totalQuestions = quizData.questions.length;
    const finalScore = (totalPoints / totalQuestions) * 10;

    return { 
        correctCount,
        partialCount, 
        incorrectCount, 
        totalQuestions,
        score: finalScore.toFixed(2) // Display standard 2 decimals for the big score
    };
  };

  const { correctCount, partialCount, incorrectCount, totalQuestions, score } = calculateResults();
  const showPercentage = activeSettings.quizSizeMode === 'percentage' && activeSettings.quizSize < 100;

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

  // Return to upload page - preserves uploaded file
  const handleFinish = () => {
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
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {correctCount} <span className={`text-lg font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/{totalQuestions}</span>
            </span>
          </div>

          {hasMultiChoice && (
            <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-50'} rounded-lg`}>
              <span className={`font-medium ${mutedText}`}>Partial Correct Answers</span>
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {partialCount} <span className={`text-lg font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/{totalQuestions}</span>
              </span>
            </div>
          )}

          <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-red-900' : 'bg-red-50'} rounded-lg`}>
            <span className={`font-medium ${mutedText}`}>Incorrect Answers</span>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {incorrectCount} <span className={`text-lg font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/{totalQuestions}</span>
            </span>
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
            title="Review answers"
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
            title="Retry Quiz"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Quiz
          </button>
          <button
            onClick={handleFinish}
            className={`w-full flex items-center justify-center px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg font-medium transition-all`}
            title="Return to Upload"
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
              <button onClick={retrySameLayout} className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all" title="Retry previous Quiz">
                Same Layout
                <span className="block text-sm text-indigo-200 mt-1">Keep the same question and option order</span>
              </button>
              <button onClick={retryNewShuffle} className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all" title="Do a new Quiz">
                New Shuffle
                <span className="block text-sm text-purple-200 mt-1">Randomize questions and options again</span>
              </button>
              <button onClick={() => setShowRetryModal(false)} className={`w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} rounded-lg font-medium transition-all`} title="Return">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
