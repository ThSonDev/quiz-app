import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/useTheme';
import { useBackGuard } from '../../hooks/useBackGuard';
import { isMultiChoice, isCorrectOption, isOptionChosen } from '../../utils/utils';
import AnswerOption from '../ui/AnswerOption';
import QuizProgressBar from '../ui/QuizProgressBar';
import Explanation from '../ui/Explanation';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { IconReturnUpload, IconChevronLeft, IconArrowRight } from '../ui/icons';

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
  const multiChoice = isMultiChoice(question);

  // Reset the in-progress multi-choice picks whenever the user navigates.
  useEffect(() => {
    setMultiSelection([]);
  }, [currentQuestion]);

  // Mobile/browser Back shows the exit confirmation instead of leaving the app
  // (mirrors the on-screen "Return to Upload" button).
  useBackGuard(() => setShowExitModal(true));

  const handleAnswerSelect = (optionIndex) => {
    if (isAnswered) return;

    if (multiChoice) {
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
    if (isAnswered) return isOptionChosen(userAnswer, idx);
    return multiChoice ? multiSelection.includes(idx) : false;
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto py-8 animate-fadeInUp">
        <div className="mb-4">
          <button
            onClick={() => setShowExitModal(true)}
            className={`flex items-center px-4 py-2 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-600'
            } text-white rounded-lg font-medium hover:bg-gray-700 transition-all`}
            title="Return to Upload"
          >
            <IconReturnUpload className="w-4 h-4 mr-2" />
            Return to Upload
          </button>
        </div>

        <QuizProgressBar
          answered={answeredCount}
          total={totalQuestions}
          currentQuestion={currentQuestion}
        />

        <div className={`${classes.cardBg} rounded-xl shadow-lg p-8`}>
          {multiChoice && (
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
                isCorrectOption={isCorrectOption(question, idx)}
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
              <IconChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            {multiChoice && !isAnswered ? (
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
                <IconArrowRight className="w-5 h-5 ml-2" />
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
          <Button variant="danger" onClick={handleExit} className="w-full" title="Exit">
            Yes, Exit Quiz
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowExitModal(false)}
            className="w-full"
            title="Don't exit"
          >
            Cancel
          </Button>
        </Modal>
      )}
    </div>
  );
};

export default QuizPage;
