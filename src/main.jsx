import React from 'react'
import ReactDOM from 'react-dom/client'
import QuizApp from './App.jsx'
import { ThemeProvider } from './contexts/ThemeProvider.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <QuizApp />
    </ThemeProvider>
  </React.StrictMode>,
)
