import { calculateQuestionScore } from '../../utils/utils';

const ReviewPage = ({ isDarkMode, quizData, answers, setView }) => {
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const mutedText = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const maxPointPerQuestion = 10 / quizData.questions.length;

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
            
            // MODIFIED: Calculate Score using new logic
            const rawScore = calculateQuestionScore(question, userAnswer); // 0 to 1
            const displayedScore = (rawScore * maxPointPerQuestion).toFixed(3);
            
            // Determine Badge Color
            let badgeClass = "px-3 py-1 rounded-full text-sm font-bold ml-2 ";
            if (rawScore === 1) {
                // Full Score: Green
                badgeClass += isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
            } else if (rawScore === 0) {
                // Zero Score: Red
                badgeClass += isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800';
            } else {
                // Partial Score: Yellow
                badgeClass += isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
            }
            
            return (
              <div key={idx} className={`${cardBg} rounded-xl shadow-lg p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`text-xl font-bold ${textColor} flex-1`}>
                    {idx + 1}. {question.question}
                  </h3>
                  
                  <span className={badgeClass}>
                    {parseFloat(displayedScore)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {question.options.map((option, optIdx) => {
                    let optionClass = "p-3 rounded-lg border-2 flex items-center justify-between ";
                    
                    const isCorrectOption = Array.isArray(question.correctAnswer) 
                        ? question.correctAnswer.includes(optIdx)
                        : question.correctAnswer === optIdx;

                    const isSelectedByUser = Array.isArray(userAnswer)
                        ? userAnswer.includes(optIdx)
                        : userAnswer === optIdx;
                    
                    // Option Coloring Logic (Same as before)
                    if (isCorrectOption) {
                      optionClass += isDarkMode ? 'bg-green-900 border-green-600' : 'bg-green-50 border-green-500';
                    } else if (isSelectedByUser && !isCorrectOption) { 
                      optionClass += isDarkMode ? 'bg-red-900 border-red-600' : 'bg-red-50 border-red-500';
                    } else {
                      optionClass += isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
                    }

                    return (
                      <div key={optIdx} className={optionClass}>
                         {/* Option Content ... same as before ... */}
                         <div className="flex items-center">
                            <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{option}</span>
                         </div>

                         {/* Icons ... same as before ... */}
                         <div className="flex items-center">
                            {isCorrectOption && (
                              <span className={`ml-2 font-medium text-sm flex items-center ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                                ✓ Correct
                              </span>
                            )}
                            {isSelectedByUser && !isCorrectOption && (
                              <span className={`ml-2 font-medium text-sm flex items-center ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                                ✗ Your answer
                              </span>
                            )}
                         </div>
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
