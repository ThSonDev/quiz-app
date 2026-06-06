import {
  calculateQuestionScore,
  isCorrectOption,
  isOptionChosen,
  optionLabel,
} from '../../utils/utils';
import { useTheme } from '../../contexts/useTheme';
import Explanation from '../ui/Explanation';

const ReviewPage = ({ quizData, answers, setView }) => {
  const { isDarkMode, classes } = useTheme();
  const maxPointPerQuestion = 10 / quizData.questions.length;

  const badgeFor = (rawScore) => {
    let cls = 'px-3 py-1 rounded-full text-sm font-bold ml-2 ';
    if (rawScore === 1) cls += isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
    else if (rawScore === 0) cls += isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800';
    else cls += isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
    return cls;
  };

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

        <div className={`${classes.cardBg} rounded-xl shadow-lg p-6 mb-6`}>
          <h2 className={`text-2xl font-bold ${classes.textColor} mb-2`}>Review All Answers</h2>
          <p className={classes.mutedText}>See all questions, correct answers, and explanations</p>
        </div>

        <div className="space-y-6">
          {quizData.questions.map((question, idx) => {
            const userAnswer = answers[idx];
            const rawScore = calculateQuestionScore(question, userAnswer);
            const displayedScore = (rawScore * maxPointPerQuestion).toFixed(3);

            return (
              <div key={idx} className={`${classes.cardBg} rounded-xl shadow-lg p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`text-xl font-bold ${classes.textColor} flex-1`}>
                    {idx + 1}. {question.question}
                  </h3>
                  <span className={badgeFor(rawScore)}>{parseFloat(displayedScore)}</span>
                </div>

                <div className="space-y-2 mb-4">
                  {question.options.map((option, optIdx) => {
                    const correct = isCorrectOption(question, optIdx);
                    const selectedByUser = isOptionChosen(userAnswer, optIdx);

                    let optionClass = 'p-3 rounded-lg border-2 flex items-center justify-between ';
                    if (correct) {
                      optionClass += isDarkMode ? 'bg-green-900 border-green-600' : 'bg-green-50 border-green-500';
                    } else if (selectedByUser && !correct) {
                      optionClass += isDarkMode ? 'bg-red-900 border-red-600' : 'bg-red-50 border-red-500';
                    } else {
                      optionClass += isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
                    }

                    return (
                      <div key={optIdx} className={optionClass}>
                        <div className="flex items-center">
                          <span className="font-bold mr-2">{optionLabel(optIdx)}.</span>
                          <span>{option}</span>
                        </div>
                        <div className="flex items-center">
                          {correct && (
                            <span className={`ml-2 font-medium text-sm flex items-center ${
                              isDarkMode ? 'text-green-400' : 'text-green-700'
                            }`}>
                              ✓ Correct
                            </span>
                          )}
                          {selectedByUser && !correct && (
                            <span className={`ml-2 font-medium text-sm flex items-center ${
                              isDarkMode ? 'text-red-400' : 'text-red-700'
                            }`}>
                              ✗ Your answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {question.explanation && <Explanation>{question.explanation}</Explanation>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
