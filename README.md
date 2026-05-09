# Interactive Quiz Application

A modern, feature-rich web-based quiz application with customizable shuffle options and comprehensive result tracking.

## Live Demo

**[You can try it now on Vercel](https://open-quiz-application.vercel.app/)**

## Features

- **JSON-based quizzes** - Upload your own quiz data
- **Single & multiple choice** - Mix both types in the same quiz; multi-choice answers are scored with partial credit (F1)
- **Smart shuffling** - Randomize questions and/or answer options. Override shuffle settings for specific questions
- **Quiz Size (%)** - Choose what percentage of the total questions to include (e.g., 50% = half the quiz) or specify the exact number of questions to attempt
- **Review mode** - Comprehensive review of all answers after completion
- **Retry functionality** - Retake quizzes with same layout or re-shuffling
- **Responsive design** - Works seamlessly on all devices
- **Dark/light mode** - Protects your eyes

## Tech Stack

- **React** - UI library
- **JavaScript (ES6+)** - Core logic
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool / dev server

## Installation

Requires Node.js 18+ and npm.

```bash
# Clone the repository
git clone https://github.com/ThSonDev/quiz-app.git
cd quiz-app

# Install dependencies
npm install

# Start the dev server (http://localhost:5173 by default)
npm run dev

# Production build
npm run build

# Preview the production build
npm run preview
```

## Project Structure

```
quiz-app/
├── src/
│   ├── App.jsx                    # Top-level state + page routing
│   ├── main.jsx                   # React entry point
│   ├── components/
│   │   ├── pages/
│   │   │   ├── JSONUploadPage.jsx # Upload + shuffle/size settings
│   │   │   ├── QuizPage.jsx       # Question runner
│   │   │   ├── ResultPage.jsx     # Score summary + retry
│   │   │   └── ReviewPage.jsx     # Per-question review
│   │   └── ui/
│   │       └── ThemeToggle.jsx    # Dark/light toggle
│   └── utils/
│       └── utils.js               # Shuffle, validation, scoring
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## How to Use

### 1. Prepare Your Quiz JSON

Create a JSON file with the following structure:

```json
{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["London", "Paris", "Berlin", "Madrid"],
      "correctAnswer": 1,
      "explanation": "Paris is the capital and largest city of France."
    },
    {
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1,
      "explanation": "Basic arithmetic: 2 + 2 = 4",
      "shuffle": 0
    }
  ]
}
```

#### JSON Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | ✅ Yes | The question text |
| `options` | array | ✅ Yes | Array of answer choices (minimum 2) |
| `correctAnswer` | number \| number[] | ✅ Yes | Index of the correct answer (0-based). Use an array of indices for **multiple choice** questions |
| `explanation` | string | ❌ No | Explanation shown after answering |
| `shuffle` | number | ❌ No | Set to `0` to prevent option shuffling for this question |

### 2. Configure Shuffle Settings

Before uploading your quiz:
- Toggle **"Shuffle Questions"** to randomize question order
- Toggle **"Shuffle Options"** to randomize answer choices
- Both shuffle options are OFF by default
- Set **"Quiz Size (%/#)"** to choose how many questions to take: 
  - Default: `100` % (use all questions)  
  - Range: `10–100` (for percentage mode)
  - Or the exact number of questions you want to answer (number mode)

### 3. Upload and Start

1. Click the upload area or drag-and-drop your JSON file
2. The app validates your file and show the total number of questions
4. Click Start quiz to begin
5. Answer questions one at a time
6. Navigate with Previous/Next buttons

### 4. View Results

After completing all questions:
- See your score (out of 10)
- View correct/incorrect counts
- **Review** - See all questions with correct answers
- **Retry** - Take the quiz again
- **Finish** - Upload a new quiz

### Multiple Choice Questions

To create a multiple-choice question (more than one correct answer), set `correctAnswer` to an **array** of indices:

```json
{
  "question": "Which of these are JavaScript runtimes?",
  "options": ["Node.js", "Django", "Deno", "Rails", "Bun"],
  "correctAnswer": [0, 2, 4],
  "explanation": "Node.js, Deno, and Bun are JavaScript runtimes."
}
```

How it works:
- A question is treated as multi-choice when `correctAnswer` is an array with **2 or more** indices. A single-element array still behaves as single choice.
- The UI shows a "Multiple Choices" label and a **Confirm** button — pick any number of options, then confirm to submit.
- Scoring uses an **F1 score** (precision/recall) so partial credit is awarded:
  - All correct + nothing extra → full point (Correct)
  - Empty selection or all wrong → 0 points (Incorrect)
  - Anything in between → partial points (shown as "Partial Correct" on the result page)
- Final score is normalized to a value out of 10: `(sum of per-question scores / total questions) × 10`.

### Per-Question Override
- Add `"shuffle": 0` to any question to prevent its options from shuffling
- Useful for questions where order matters (e.g., "All of the above", chronological order)
- Other questions still follow the global shuffle setting

### Example
```json
{
  "question": "Which of the following are primary colors?",
  "options": ["Red", "Blue", "Yellow", "All of the above"],
  "correctAnswer": 3,
  "explanation": "Red, blue, and yellow are primary colors.",
  "shuffle": 0
}
```
In this example, options won't shuffle even if "Shuffle Options" is ON, preventing "All of the above" from appearing in the middle.

## Contributing

Feel free to open issues or submit pull requests for improvements!

## License

MIT License - feel free to use this project for personal or commercial purposes.



