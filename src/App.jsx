import { useState } from 'react';
import JSONUploadPage from './components/pages/JSONUploadPage';
import QuizPage from './components/pages/QuizPage';
import ResultPage from './components/pages/ResultPage';
import ReviewPage from './components/pages/ReviewPage';
import QuizCreatorPage from './components/pages/QuizCreatorPage';
import ThemeToggle from './components/ui/ThemeToggle';
import { useTheme } from './contexts/useTheme';

const App = () => {
  const { classes } = useTheme();

  // upload, quiz, results, review, create
  const [view, setView] = useState('upload');

  // Quiz data and state
  const [originalQuizData, setOriginalQuizData] = useState(null);
  const [processedQuizData, setProcessedQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Keeps the picked file alive across navigation so the user can come back
  // to the upload page without re-selecting it.
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);

  const [activeSettings, setActiveSettings] = useState({
    shuffleQuestions: false,
    shuffleOptions: false,
    quizSize: 100,
    quizSizeMode: 'percentage',
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${classes.pageGradient}`}>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {view === 'upload' && (
        <JSONUploadPage
          setView={setView}
          setOriginalQuizData={setOriginalQuizData}
          setProcessedQuizData={setProcessedQuizData}
          setActiveSettings={setActiveSettings}
          setAnswers={setAnswers}
          setCurrentQuestion={setCurrentQuestion}
          uploadedFileInfo={uploadedFileInfo}
          setUploadedFileInfo={setUploadedFileInfo}
        />
      )}

      {view === 'quiz' && (
        <QuizPage
          quizData={processedQuizData}
          answers={answers}
          setAnswers={setAnswers}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          setView={setView}
        />
      )}

      {view === 'results' && (
        <ResultPage
          quizData={processedQuizData}
          originalQuizData={originalQuizData}
          answers={answers}
          setAnswers={setAnswers}
          activeSettings={activeSettings}
          setCurrentQuestion={setCurrentQuestion}
          setProcessedQuizData={setProcessedQuizData}
          setView={setView}
        />
      )}

      {view === 'review' && (
        <ReviewPage
          quizData={processedQuizData}
          answers={answers}
          setView={setView}
        />
      )}

      {view === 'create' && <QuizCreatorPage setView={setView} />}
    </div>
  );
};

export default App;
