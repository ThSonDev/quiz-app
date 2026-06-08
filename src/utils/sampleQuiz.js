// A built-in sample quiz, always available so a first-time visitor can try the
// app without authoring or uploading anything. It is intentionally a tour of the
// quiz format's features: single-choice, multiple-choice (partial-credit F1
// scoring), a single-element `correctAnswer` array (an edge case that still
// behaves as single choice), a per-question `shuffle: 0` override, a two-option
// true/false question, an omitted (optional) `explanation`, and a mix of option
// counts. The questions are broadly known worldwide but a few (7 × 8, the prime
// and primary-colour sets, programming languages) are easy to slip on, so a
// casual run usually shows off correct / partial / incorrect scoring.

import { hashQuiz } from './storage.js';

export const SAMPLE_QUIZ_NAME = 'Sample Quiz';

export const sampleQuizData = {
  questions: [
    {
      question: 'What is the capital of Japan?',
      options: ['Seoul', 'Tokyo', 'Beijing', 'Bangkok'],
      correctAnswer: 1,
      explanation: 'Tokyo has been the capital of Japan since 1868.',
    },
    {
      question: 'What is 7 × 8?',
      options: ['54', '56', '63', '48'],
      correctAnswer: 1,
      explanation: '7 × 8 = 56 — a multiplication fact that is commonly misremembered.',
    },
    {
      // Multiple choice: pick any number of options, then Confirm. Partial
      // credit (F1) means getting some right still scores.
      question: 'Which of these are primary colors in the traditional color model?',
      options: ['Red', 'Green', 'Blue', 'Yellow', 'Orange'],
      correctAnswer: [0, 2, 3],
      explanation: 'The traditional primary colors are red, blue and yellow. Green and orange are made by mixing primaries.',
    },
    {
      // Minimum two options — a true/false style question.
      question: 'True or False: The Great Wall of China is easily visible from space with the naked eye.',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: 'This is a popular myth. The wall is far too narrow to make out unaided from orbit.',
    },
    {
      question: 'Which of these numbers are prime?',
      options: ['2', '9', '11', '15', '21'],
      correctAnswer: [0, 2],
      explanation: 'Only 2 and 11 are prime. 9 = 3×3, 15 = 3×5 and 21 = 3×7.',
    },
    {
      // `shuffle: 0` keeps "All of the above" in place even when option
      // shuffling is on.
      question: 'Which of these actions helps cut down on waste?',
      options: ['Reduce', 'Reuse', 'Recycle', 'All of the above'],
      correctAnswer: 3,
      explanation: 'All three help. Because this question sets "shuffle": 0, "All of the above" stays last even when option shuffling is turned on.',
      shuffle: 0,
    },
    {
      question: 'How many continents are there on Earth?',
      options: ['5', '6', '7', '8'],
      correctAnswer: 2,
      explanation: 'There are 7 continents: Africa, Antarctica, Asia, Europe, North America, Oceania and South America.',
    },
    {
      // Edge case: a single-element array still counts as single choice.
      question: 'What is the chemical symbol for water?',
      options: ['O2', 'H2O', 'CO2', 'NaCl'],
      correctAnswer: [1],
      explanation: 'Water is H2O — two hydrogen atoms and one oxygen atom.',
    },
    {
      // Explanation deliberately omitted — it is an optional field.
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 3,
    },
    {
      question: 'Which of these are programming languages?',
      options: ['Python', 'HTML', 'Java', 'CSS', 'JavaScript'],
      correctAnswer: [0, 2, 4],
      explanation: 'Python, Java and JavaScript are programming languages. HTML is a markup language and CSS is a stylesheet language.',
    },
  ],
};

// A saved-library-entry-shaped wrapper for the sample, so it flows through the
// same "select / load / results history" machinery as real saved quizzes. The
// id is content-hashed (matching how the library and history key quizzes, so the
// sample's attempts line up), `uploadedAt` is 0, and `isSample` flags it as the
// always-present, non-removable, non-bookmarkable entry pinned to the bottom of
// the list. It is never written to storage.
export const sampleQuizEntry = {
  id: hashQuiz(sampleQuizData),
  name: SAMPLE_QUIZ_NAME,
  questionCount: sampleQuizData.questions.length,
  uploadedAt: 0,
  bookmarked: false,
  rawData: sampleQuizData,
  isSample: true,
};
