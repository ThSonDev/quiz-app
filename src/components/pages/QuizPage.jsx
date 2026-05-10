import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/useTheme';
import AnswerOption from '../ui/AnswerOption';
import QuizProgressBar from '../ui/QuizProgressBar';
import Explanation from '../ui/Explanation';
import Modal from '../ui/Modal';

const QuizPage = ({
  quizData,
  answers,
  setAnswers,
  currentQuestion,
  setCurrentQuestion,
  setView,
}) => {
  const { isDarkMode, classes } = useTheme();
  const [showExitModal, setShowExitModal] = useState(false);
  const [multiSelection, setMultiSelection] = useState([]);

  const question = quizData.questions[currentQuestion];
  const userAnswer = answers[currentQuestion];
  const isAnswered = userAnswer !== undefined;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quizData.questions.length;
  const isMultiChoice =
    Array.isArray(question.correctAnswer) && question.correctAnswer.length > 1;

  // Reset the in-progress multi-choice picks whenever the user navigates.
  useEffect(() => {
    setMultiSelection([]);
  }, [currentQuestion]);

  const handleAnswerSelect = (optionIndex) => {
    if (isAnswered) return;

    if (isMultiChoice) {
      setMultiSelection((prev) =>
        prev.includes(optionIndex)
          ? prev.filter((i) => i !== optionIndex)
          : [...prev, optionIndex]
      );
    } else {
      setAnswers({ ...answers, [currentQuestion]: optionIndex });
    }
  };

  // Sort indices so the multi-choice answer can be compared by-equality later.
  const handleConfirmMulti = () => {
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
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleExit = () => {
    setView('upload');
    setShowExitModal(false);
  };

  const isOptionSelected = (idx) => {
    if (isAnswered) {
      return Array.isArray(userAnswer) ? userAnswer.includes(idx) : userAnswer === idx;
    }
    return isMultiChoice ? multiSelection.includes(idx) : false;
  };

  const isOptionCorrect = (idx) =>
    Array.isArray(question.correctAnswer)
      ? question.correctAnswer.includes(idx)
      : question.correctAnswer === idx;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-4">
          <button
            onClick={() => setShowExitModal(true)}
            className={`flex items-center px-4 py-2 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-600'
            } text-white rounded-lg font-medium hover:bg-gray-700 transition-all`}
            title="Return to Upload"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Upload
          </button>
        </div>

        <QuizProgressBar
          answered={answeredCount}
          total={totalQuestions}
          currentQuestion={currentQuestion}
        />

        <div className={`${classes.cardBg} rounded-xl shadow-lg p-8`}>
          {isMultiChoice && (
            <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${
              isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              Multiple Choices
            </p>
          )}
          <h2 className={`text-2xl font-bold ${classes.textColor} mb-6`}>{question.question}</h2>

          <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => (
              <AnswerOption
                key={idx}
                option={option}
                index={idx}
                isSelected={isOptionSelected(idx)}
                isCorrectOption={isOptionCorrect(idx)}
                isAnswered={isAnswered}
                onClick={() => handleAnswerSelect(idx)}
              />
            ))}
          </div>

          {isAnswered && question.explanation && (
            <Explanation>{question.explanation}</Explanation>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                currentQuestion === 0
                  ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                  : classes.secondaryBtn
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
                {currentQuestion === totalQuestions - 1 && answeredCount === totalQuestions
                  ? 'Finish'
                  : 'Next'}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {showExitModal && (
        <Modal
          title="Exit Quiz?"
          description="Are you sure you want to exit? Your progress will be lost."
        >
          <button
            onClick={handleExit}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
            title="Exit"
          >
            Yes, Exit Quiz
          </button>
          <button
            onClick={() => setShowExitModal(false)}
            className={`w-full px-6 py-3 ${classes.secondaryBtn} rounded-lg font-medium transition-all`}
            title="Don't exit"
          >
            Cancel
          </button>
        </Modal>
      )}
    </div>
  );
};

export default QuizPage;
