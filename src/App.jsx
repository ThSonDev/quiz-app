import React, { useState, useEffect } from 'react';
import JSONUploadPage from './components/pages/JSONUploadPage';
import QuizPage from './components/pages/QuizPage';
import ResultPage from './components/pages/ResultPage';
import ReviewPage from './components/pages/ReviewPage';
import ThemeToggle from './components/ui/ThemeToggle';

const App = () => {
  // View management
  const [view, setView] = useState('upload'); // upload, quiz, results, review
  
  // Theme management
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Quiz data and state
  const [originalQuizData, setOriginalQuizData] = useState(null);
  const [processedQuizData, setProcessedQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Settings
  const [activeSettings, setActiveSettings] = useState({
    shuffleQuestions: false,
    shuffleOptions: false,
    quizSize: 100,
    quizSizeMode: 'percentage'
  });

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('quizAppTheme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // Save theme to localStorage when changed
  useEffect(() => {
    localStorage.setItem('quizAppTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Theme classes
  const themeClasses = isDarkMode
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* Theme toggle - always visible */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </div>

      {/* Page routing */}
      {view === 'upload' && (
        <JSONUploadPage
          isDarkMode={isDarkMode}
          setView={setView}
          setOriginalQuizData={setOriginalQuizData}
          setProcessedQuizData={setProcessedQuizData}
          setActiveSettings={setActiveSettings}
          setAnswers={setAnswers}
          setCurrentQuestion={setCurrentQuestion}
        />
      )}

      {view === 'quiz' && (
        <QuizPage
          isDarkMode={isDarkMode}
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
          isDarkMode={isDarkMode}
          quizData={processedQuizData}
          originalQuizData={originalQuizData}
          answers={answers}
          setAnswers={setAnswers}
          activeSettings={activeSettings}
          setCurrentQuestion={setCurrentQuestion}
          setProcessedQuizData={setProcessedQuizData}
          setView={setView}
          setOriginalQuizData={setOriginalQuizData}
        />
      )}

      {view === 'review' && (
        <ReviewPage
          isDarkMode={isDarkMode}
          quizData={processedQuizData}
          answers={answers}
          setView={setView}
        />
      )}
    </div>
  );
};

export default App;