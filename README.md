# Interactive Quiz Application

A modern, feature-rich web-based quiz application with customizable shuffle options and comprehensive result tracking.

## Live Demo

**[You can try it now on Vercel](https://open-quiz-application.vercel.app/)**

## Features

- **JSON-based quizzes** - Upload your own quiz data (`.json` or `.txt`)
- **Built-in sample quiz** - A 10-question sample is always available, so you can try everything without creating a file first
- **Saved quiz library** - Previously uploaded quizzes are remembered in your browser (no login); pick one to redo, edit its questions, bookmark favorites to the top, or remove them
- **Results history** - Every finished attempt is saved per quiz (score, breakdown, and the exact layout you saw); re-open a past attempt to review it or retry it, and see how your score changed versus your last same-size attempt
- **Built-in Quiz Creator** - Build a quiz in the browser and download it as `.json` or `.txt`
- **Single & multiple choice** - Mix both types in the same quiz; multi-choice answers are scored with partial credit (F1)
- **Smart shuffling** - Randomize questions and/or answer options. Override shuffle settings for specific questions
- **Quiz Size (% or #)** - Take a percentage of the questions (e.g., 50% = half the quiz) **or** an exact number; each mode remembers its own value
- **Review mode** - Comprehensive review of all answers after completion
- **Retry functionality** - Retake quizzes with same layout or re-shuffling
- **Responsive design** - Works seamlessly on all devices
- **Dark/light mode** - Protects your eyes

## Tech Stack

- **React** - UI library
- **JavaScript (ES6+)** - Core logic
- **Tailwind CSS** - Styling
- **Custom inline SVG icons** - A small named icon set in `src/components/ui/icons.jsx` (no runtime icon dependency)
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

# Run the domain test suite
npm test
```

## Project Structure

```
quiz-app/
├── api/
│   └── proxy.js                      # Stateless Edge proxy for share-link fetches
├── src/
│   ├── App.jsx                       # Top-level state + page routing
│   ├── main.jsx                      # React entry, wraps app in ThemeProvider
│   ├── contexts/
│   │   ├── ThemeContext.js           # createContext export
│   │   ├── ThemeProvider.jsx         # Owns isDarkMode + derived class strings
│   │   └── useTheme.js               # Hook used by every component
│   ├── components/
│   │   ├── pages/
│   │   │   ├── JSONUploadPage.jsx    # Upload + shuffle/size settings
│   │   │   ├── QuizPage.jsx          # Question runner
│   │   │   ├── ResultPage.jsx        # Score summary + retry
│   │   │   ├── ReviewPage.jsx        # Per-question review
│   │   │   └── QuizCreatorPage.jsx   # In-browser quiz editor
│   │   └── ui/
│   │       ├── icons.jsx             # Shared named inline-SVG icon set
│   │       ├── Button.jsx            # Shared action button with variants
│   │       ├── ToggleSwitch.jsx      # Switch + labelled SettingToggle row
│   │       ├── ErrorBanner.jsx       # Shared red message banner
│   │       ├── Pagination.jsx        # Prev / Page X of Y / Next control
│   │       ├── ThemeToggle.jsx       # Dark/light toggle
│   │       ├── QuizLibraryPane.jsx   # Slide-over list of saved quizzes
│   │       ├── HistoryPane.jsx       # Slide-over list of a quiz's past attempts
│   │       ├── ShareQuizDialog.jsx   # Build a shareable quiz link
│   │       ├── ConfigChips.jsx       # Size/shuffle settings chips
│   │       ├── IconButton.jsx        # Small round icon action button
│   │       ├── Modal.jsx             # Generic centered confirm modal
│   │       ├── AnswerOption.jsx      # Answer button used by QuizPage
│   │       ├── QuizProgressBar.jsx   # Progress card for QuizPage
│   │       ├── Explanation.jsx       # Shared explanation panel
│   │       ├── RichText.jsx          # Renders quiz text (line breaks + highlight/underline markup)
│   │       ├── QuestionEditor.jsx    # One question card in the creator
│   │       └── OptionEditor.jsx      # One option row in the creator
│   ├── hooks/
│   │   ├── useQuizLibrary.js         # Saved-quiz library state + persistence
│   │   ├── useBackGuard.js           # Intercept browser/mobile Back action
│   │   └── useBodyScrollLock.js      # Reference-counted body scroll lock for slide-overs
│   └── utils/
│       ├── utils.js                  # Shuffle, validation, scoring, results, download
│       ├── quizCreator.js            # Creator <-> upload shape converters
│       ├── sampleQuiz.js             # Built-in 10-question sample quiz
│       ├── storage.js                # Saved-quiz library
│       ├── history.js                # Results history per quiz
│       ├── share.js                  # Share-link parse/build + proxy fetch
│       ├── urlSafety.js              # SSRF/origin guards for the proxy
│       ├── persistence.js            # In-memory cache + IndexedDB write-through (localStorage fallback)
│       └── idb.js                    # Tiny IndexedDB key-value wrapper
├── tests/
│   └── domain/                       # node:test suites for the pure logic
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## How to Use

### 1. Prepare Your Quiz

You have two options:

**Option A — Use the built-in Quiz Creator** (no JSON required)

On the upload page, click **Create Your Own Quiz** to open the in-browser editor. Fill in your questions and download the result as a `.json` or `.txt` file. See the [Quiz Creator](#quiz-creator) section below.

**Option B — Author the JSON yourself**

Create a `.json` (or `.txt`) file with the following structure:

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

#### Text formatting

Questions, options, and explanations support a few lightweight formatting marks:

- **Line breaks** — a newline in the text starts a new line. In JSON write `\n`, e.g. `"First line.\nSecond line."`
- **Highlight** — wrap text in double asterisks to emphasize it in purple (stands out in both light and dark mode): `"The **important** part is highlighted."`
- **Underline** — wrap text in double underscores to underline it: `"The __key__ word is underlined."`

### 2. Configure Shuffle Settings

Before uploading your quiz:
- Toggle **"Shuffle Questions"** to randomize question order
- Toggle **"Shuffle Options"** to randomize answer choices
- Both shuffle options are OFF by default
- Set **"Quiz Size"** to choose how many questions to take. Use the **`%`** / **`#`** buttons to switch modes:
  - **`%` (percentage):** `10–100`, default `100` (use all questions)
  - **`#` (count):** an exact number of questions; pre-filled with the loaded quiz's full size
  - The two modes keep **separate** values — switching back and forth never turns a count like `7` into a bogus `7%`; each mode remembers what you last set

### 3. Upload and Start

1. Click the upload area or drag-and-drop your `.json` or `.txt` file
2. The app validates your file and shows the total number of questions, plus a quick summary of your selected settings (quiz size and which shuffles are on)
3. Click Start quiz to begin
4. Answer questions one at a time
5. Navigate with Previous/Next buttons

> Both `.json` and `.txt` are accepted. Either way the file must contain valid quiz JSON; only the extension differs.

#### Try the sample quiz

Don't have a quiz file yet? A built-in **Sample Quiz** (10 questions covering all the quiz features) is always available:

- If you haven't saved any quizzes, a **Load a sample quiz** button appears on the upload page — click it to load the sample, then configure and start as usual.
- Once you do have saved quizzes, the sample moves to the **bottom of the Choose a Saved Quiz list**, so it's always there to fall back on.

#### Saved quizzes

Every quiz you upload is saved in your browser, so you can come back later and redo it without re-picking the file. Once you have at least one saved quiz, a **Choose a Saved Quiz** button appears on the upload page and opens a side panel listing them by upload time, with file name and question count. From there you can:

- Select a quiz to load it, then configure shuffle/size and start as usual
- Edit a loaded quiz: click the pencil on the loaded-quiz card to open it in the editor, change its questions, and Save Changes back to your saved quizzes
- Star a quiz to bookmark it to the top of the list
- Remove quizzes you no longer want

Quizzes that share a name and question count but have different content are kept as separate entries, distinguished by upload time. This data lives only in the current browser (no account, no sync); clearing site data removes it.

#### Share a quiz by link

You can send a friend a link that loads one of your quizzes with your chosen settings already applied.

1. Set the shuffle/size options you want to share, then click the **Share** button — either on the loaded-quiz card or next to any quiz in your **Saved Quizzes** list.
2. In the dialog, **Download** your quiz file, then upload it somewhere with a public link — a [GitHub gist](https://gist.github.com/) "Raw" URL works well.
3. Paste that public link, click **Generate link**, and copy it. (Optionally hit **Test link** to confirm it loads.)
4. Send the link. When your friend opens it, the quiz and your settings load automatically, ready to start.

> Prefer not to host a file? You can also just **send the downloaded quiz file** to your friend and let them upload it themselves — hosting is only needed when you want a one-click link.

The first time they open it, their app fetches the quiz from your link and saves it to their browser. If they open the same link again later, it loads instantly from their browser with no re-download — and works offline. Your friend never needs an account, and nothing about them is stored anywhere but their own browser.

### 4. View Results

After completing all questions:
- See your score (out of 10), with a **+/- change badge** on the score circle showing how you did versus your most recent attempt of the **same size** (hidden when there's no comparable past attempt)
- View correct/incorrect (and, for multi-choice quizzes, partial) counts
- **Review** - See all questions with correct answers
- **Retry** - Take the quiz again (same layout, or re-shuffle)
- **Finish** - Return to the upload page

#### Results history

Finishing a quiz saves that attempt. You can revisit it two ways:

- From the **Review** page, click **Results history** (top-right) to open a side panel of that quiz's attempts.
- From the **saved-quiz library** panel, any quiz with past attempts shows a **Results history** link.

Each row shows the date, the score `/10`, and the configuration used (shuffle and size). Click a reviewable attempt to re-open its result page — you can review every answer exactly as you saw it, or retry that same layout. Opening a past attempt shows a **Return Back** button instead of Finish, taking you back where you came from.

> **Editing a quiz invalidates its old attempts.** Because editing changes the questions, the saved layouts no longer match — so on save, that quiz's history is kept as **score-only** records (you still see the past scores, but they can't be re-opened for review). The editor warns you before saving when this applies.

This history lives only in the current browser (no account, no sync); clearing site data removes it.

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

## Quiz Creator

If you'd rather not write JSON by hand, the upload page has a **Create Your Own Quiz** button that opens an in-browser editor.

What you can do:
- Start from scratch, or click **Upload Your Quiz** to import an existing `.json`/`.txt` quiz and edit it
- Add and remove questions
- Toggle each question between **Single Choice** and **Multiple Choice**
- Add and remove options (minimum 2 per question)
- Mark the correct answer (radio for single, checkboxes for multi)
- Add an optional explanation per question
- Tick "Never shuffle options for this question" to emit `"shuffle": 0`
- Pick a file name and download as **`.json`** or **`.txt`**

Questions are paginated 10 per page; the file name and download/save controls stay visible below regardless of the page.

Imported files are validated against the schema above before loading; if you already have questions in progress, the editor asks before replacing them. The downloaded file matches the same JSON schema, so you can immediately upload it back to take the quiz. Both extensions contain identical content; pick whichever your tooling prefers.

## Privacy & storage

**Privacy-first: this app never collects or stores your personal information.** There's no account, no sign-in, no tracking, and no syncing across devices. Everything you create — your theme, saved quizzes, and results history — stays in **your browser**, in its built-in database (IndexedDB), which has plenty of room for lots of quizzes and a long history. Clearing your browser's site data removes it.

If a quiz-sharing feature ever fetches a file from a link you provide, it does so through a **stateless helper that stores nothing** — it forwards the request and forgets it; no user data is ever saved server-side. (As with any website, the hosting platform still sees ordinary transport details like your IP address at the network level — we simply never persist them.)

## Contributing

Feel free to open issues or submit pull requests for improvements!

## License

MIT License - feel free to use this project for personal or commercial purposes.



