import React, { useState, useEffect } from 'react';

const ReviewPage = ({ isDarkMode, quizData, answers, setView }) => {
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="sticky top-4 z-10 mb-6">
          <button
            onClick={() => setView('results')}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg"
          >
            ← Back to Results
          </button>
        </div>

        <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6`}>
          <h2 className={`text-2xl font-bold ${textColor} mb-2`}>Review All Answers</h2>
          <p className={mutedText}>See all questions, correct answers, and explanations</p>
        </div>

        <div className="space-y-6">
          {quizData.questions.map((question, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div key={idx} className={`${cardBg} rounded-xl shadow-lg p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`text-xl font-bold ${textColor} flex-1`}>
                    {idx + 1}. {question.question}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCorrect 
                      ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                      : isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {question.options.map((option, optIdx) => {
                    let optionClass = "p-3 rounded-lg border-2 ";
                    
                    if (optIdx === question.correctAnswer) {
                      optionClass += isDarkMode ? 'bg-green-900 border-green-600' : 'bg-green-50 border-green-500';
                    } else if (optIdx === userAnswer && !isCorrect) {
                      optionClass += isDarkMode ? 'bg-red-900 border-red-600' : 'bg-red-50 border-red-500';
                    } else {
                      optionClass += isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
                    }

                    return (
                      <div key={optIdx} className={optionClass}>
                        <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                        {option}
                        {optIdx === question.correctAnswer && (
                          <span className={`ml-2 font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>✓ Correct</span>
                        )}
                        {optIdx === userAnswer && !isCorrect && (
                          <span className={`ml-2 font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>✗ Your answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (
                  <div className={`${isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                    <p className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-1`}>Explanation:</p>
                    <p className={isDarkMode ? 'text-blue-200' : 'text-blue-800'}>{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
