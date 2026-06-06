import { useState } from 'react';
import { processQuizData, isMultiChoice, summarizeResults } from '../../utils/utils';
import { useTheme } from '../../contexts/useTheme';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { IconEye, IconRetry, IconClose } from '../ui/icons';

const ResultPage = ({
  quizData,
  originalQuizData,
  answers,
  setAnswers,
  activeSettings,
  setCurrentQuestion,
  setProcessedQuizData,
  setView,
}) => {
  const { isDarkMode, classes } = useTheme();
  const [showRetryModal, setShowRetryModal] = useState(false);

  const hasMultiChoice = quizData.questions.some(isMultiChoice);

  const { correctCount, partialCount, incorrectCount, totalQuestions, score: rawScore } =
    summarizeResults(quizData.questions, answers);
  const score = rawScore.toFixed(2);
  const showPercentage = activeSettings.quizSizeMode === 'percentage' && activeSettings.quizSize < 100;

  const handleRetry = () => {
    const hasShuffleActive = activeSettings.shuffleQuestions || activeSettings.shuffleOptions;
    if (hasShuffleActive) setShowRetryModal(true);
    else retrySameLayout();
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
    setAnswers({});
    setCurrentQuestion(0);
    setView('upload');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`${classes.cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full`}>
        <div className="text-center mb-8">
          <div className={`${isDarkMode ? 'bg-green-900' : 'bg-green-100'} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className={`text-4xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{score}</span>
          </div>
          <h2 className={`text-3xl font-bold ${classes.textColor} mb-2`}>
            Quiz Complete!{showPercentage && ` (${activeSettings.quizSize}%)`}
          </h2>
          <p className={classes.mutedText}>Here are your results</p>
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
            onClick={() => setView('review')}
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
          <Button
            variant="neutral"
            onClick={handleFinish}
            className="w-full flex items-center justify-center"
            title="Return to Upload"
          >
            <IconClose className="w-5 h-5 mr-2" />
            Finish
          </Button>
        </div>
      </div>

      {showRetryModal && (
        <Modal title="Retry Quiz" description="Choose how you want to retry the quiz:">
          <Button onClick={retrySameLayout} className="w-full" title="Retry previous Quiz">
            Same Layout
            <span className="block text-sm text-indigo-200 mt-1">
              Keep the same question and option order
            </span>
          </Button>
          <Button variant="purple" onClick={retryNewShuffle} className="w-full" title="Do a new Quiz">
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
