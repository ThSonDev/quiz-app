# Interactive Quiz Application

A modern, feature-rich web-based quiz application with customizable shuffle options and comprehensive result tracking.

## Live Demo

**[You can try it now on Vercel](https://quiz-app-sage-delta-91.vercel.app/)**

## Features

- **JSON-based quizzes** - Upload your own quiz data
- **Smart shuffling** - Randomize questions and/or answer options. Override shuffle settings for specific questions
- **Quiz Size (%)** - Choose what percentage of the total questions to include (e.g., 50% = half the quiz)
- **Review mode** - Comprehensive review of all answers after completion
- **Retry functionality** - Retake quizzes with re-shuffling
- **Responsive design** - Works seamlessly on all devices

## Tech Stack

- **React** - UI library
- **JavaScript (ES6+)** - Core logic
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

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
| `correctAnswer` | number | ✅ Yes | Index of the correct answer (0-based) |
| `explanation` | string | ❌ No | Explanation shown after answering |
| `shuffle` | number | ❌ No | Set to `0` to prevent option shuffling for this question |

### 2. Configure Shuffle Settings

Before uploading your quiz:
- Toggle **"Shuffle Questions"** to randomize question order
- Toggle **"Shuffle Options"** to randomize answer choices
- Both shuffle options are OFF by default
- Set **"Quiz Size (%)"** to choose what portion of the quiz to take  
  - Default: `100` (use all questions)  
  - Range: `10–100`

### 3. Upload and Start

1. Click the upload area or drag-and-drop your JSON file
2. The app validates your file and starts the quiz
3. Answer questions one at a time
4. Navigate with Previous/Next buttons

### 4. View Results

After completing all questions:
- See your score (out of 10)
- View correct/incorrect counts
- **Review** - See all questions with correct answers
- **Retry** - Take the quiz again (with re-shuffling if enabled)
- **Finish** - Upload a new quiz

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
