import React from 'react'
import ReactDOM from 'react-dom/client'
import QuizApp from './App.jsx'
import { ThemeProvider } from './contexts/ThemeProvider.jsx'
import { hydrate } from './utils/persistence.js'
import { STORAGE_KEY } from './utils/storage.js'
import { HISTORY_KEY } from './utils/history.js'
import './index.css'

const render = () =>
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ThemeProvider>
        <QuizApp />
      </ThemeProvider>
    </React.StrictMode>,
  )

// Load the saved library + results history into the in-memory cache (migrating
// any legacy localStorage data into IndexedDB on first run) before the first
// render, so the synchronous loadLibrary()/loadHistory() reads see real data.
// hydrate() never rejects, but render unconditionally via finally as a safety net.
hydrate([STORAGE_KEY, HISTORY_KEY]).finally(render)
