import { useEffect, useState } from 'react';
import { isMultiChoice, summarizeResults } from '../../utils/utils';
import { useTheme } from '../../contexts/useTheme';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { IconEye, IconRetry, IconClose, IconChevronLeft } from '../ui/icons';

// Score change vs the previous attempt, e.g. +2.5 / -1.25, out of 10.
const formatDelta = (d) => `${d >= 0 ? '+' : ''}${parseFloat(d.toFixed(2))}`;

const ResultPage = ({
  quizData,
  answers,
  settings,
  isHistoryView,
  delta,
  onReviewAnswers,
  onRetrySameLayout,
  onRetryNewShuffle,
  onReturnBack,
  setAnswers,
  setCurrentQuestion,
  setView,
}) => {
  const { isDarkMode, classes } = useTheme();
  const [showRetryModal, setShowRetryModal] = useState(false);

  // Landing on the results should start at the top, not inherit the quiz
  // page's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hasMultiChoice = quizData.questions.some(isMultiChoice);

  const { correctCount, partialCount, incorrectCount, totalQuestions, score: rawScore } =
    summarizeResults(quizData.questions, answers);
  const score = rawScore.toFixed(2);
  const showPercentage = settings.quizSizeMode === 'percentage' && settings.quizSize < 100;

  const handleRetry = () => {
    const hasShuffleActive = settings.shuffleQuestions || settings.shuffleOptions;
    if (hasShuffleActive) setShowRetryModal(true);
    else onRetrySameLayout();
  };

  // Live results "Finish" clears the run and returns to upload. When viewing a
  // past attempt the same corner button instead returns to where the history
  // was opened from (see onReturnBack).
  const handleFinish = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setView('upload');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`${classes.cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fadeInUp`}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className={`${isDarkMode ? 'bg-green-900' : 'bg-green-100'} w-24 h-24 rounded-full flex items-center justify-center`}>
                <span className={`text-4xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{score}</span>
              </div>
              {delta != null && (
                <span
                  className={`absolute top-1 right-0 translate-x-1/3 -translate-y-1/4 px-2 py-0.5 rounded-full text-sm font-bold shadow ${
                    delta >= 0
                      ? isDarkMode ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-700'
                      : isDarkMode ? 'bg-red-800 text-red-300' : 'bg-red-100 text-red-700'
                  }`}
                  title="Change since your most recent attempt of the same size"
                >
                  {formatDelta(delta)}
                </span>
              )}
            </div>
          </div>
          <h2 className={`text-3xl font-bold ${classes.textColor} mb-2`}>
            {isHistoryView ? 'Past Attempt' : 'Quiz Complete!'}{showPercentage && ` (${settings.quizSize}%)`}
          </h2>
          <p className={classes.mutedText}>
            {isHistoryView ? 'Reviewing a saved attempt' : 'Here are your results'}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-green-900' : 'bg-green-50'} rounded-lg`}>
            <span className={`font-medium ${classes.mutedText}`}>Correct Answers</span>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {correctCount} <span className={`text-lg font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/{totalQuestions}</span>
            </span>
          </div>

          {hasMultiChoice && (
            <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-50'} rounded-lg`}>
              <span className={`font-medium ${classes.mutedText}`}>Partial Correct Answers</span>
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {partialCount} <span className={`text-lg font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/{totalQuestions}</span>
              </span>
            </div>
          )}

          <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-red-900' : 'bg-red-50'} rounded-lg`}>
            <span className={`font-medium ${classes.mutedText}`}>Incorrect Answers</span>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {incorrectCount} <span className={`text-lg font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/{totalQuestions}</span>
            </span>
          </div>

          <div className={`flex justify-between items-center p-4 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-50'} rounded-lg`}>
            <span className={`font-medium ${classes.mutedText}`}>Final Score (out of 10)</span>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{score}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="blue"
            onClick={onReviewAnswers}
            className="w-full flex items-center justify-center"
            title="Review answers"
          >
            <IconEye className="w-5 h-5 mr-2" />
            Review Answers
          </Button>
          <Button
            onClick={handleRetry}
            className="w-full flex items-center justify-center"
            title="Retry Quiz"
          >
            <IconRetry className="w-5 h-5 mr-2" />
            Retry Quiz
          </Button>
          {isHistoryView ? (
            <Button
              variant="neutral"
              onClick={onReturnBack}
              className="w-full flex items-center justify-center"
              title="Return back"
            >
              <IconChevronLeft className="w-5 h-5 mr-2" />
              Return Back
            </Button>
          ) : (
            <Button
              variant="neutral"
              onClick={handleFinish}
              className="w-full flex items-center justify-center"
              title="Return to Upload"
            >
              <IconClose className="w-5 h-5 mr-2" />
              Finish
            </Button>
          )}
        </div>
      </div>

      {showRetryModal && (
        <Modal title="Retry Quiz" description="Choose how you want to retry the quiz:" onClose={() => setShowRetryModal(false)}>
          <Button
            onClick={() => { setShowRetryModal(false); onRetrySameLayout(); }}
            className="w-full"
            title="Retry previous Quiz"
          >
            Same Layout
            <span className="block text-sm text-indigo-200 mt-1">
              Keep the same question and option order
            </span>
          </Button>
          <Button
            variant="purple"
            onClick={() => { setShowRetryModal(false); onRetryNewShuffle(); }}
            className="w-full"
            title="Do a new Quiz"
          >
            New Shuffle
            <span className="block text-sm text-purple-200 mt-1">
              Randomize questions and options again
            </span>
          </Button>
          <Button variant="secondary" onClick={() => setShowRetryModal(false)} className="w-full" title="Return">
            Cancel
          </Button>
        </Modal>
      )}
    </div>
  );
};

export default ResultPage;
