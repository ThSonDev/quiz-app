export const emptyQuestion = () => ({
  question: '',
  type: 'single',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
  explanation: '',
  noShuffleOptions: false,
});

// Converts the creator's internal question shape into the uploaded quiz JSON
// contract. Returns { error } on the first invalid question, or { data } on
// success.
export function buildQuizPayload(questions) {
  const built = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const text = q.question.trim();
    if (!text) return { error: `Question ${i + 1} is missing its text` };

    const trimmedOptions = q.options.map((o) => o.text.trim());
    if (trimmedOptions.some((t) => !t)) {
      return { error: `Question ${i + 1} has an empty option` };
    }
    if (trimmedOptions.length < 2) {
      return { error: `Question ${i + 1} needs at least 2 options` };
    }

    const correctIndices = q.options
      .map((o, idx) => (o.isCorrect ? idx : -1))
      .filter((idx) => idx !== -1);

    if (correctIndices.length === 0) {
      return { error: `Question ${i + 1} needs at least one correct answer` };
    }
    if (q.type === 'multi' && correctIndices.length < 2) {
      return {
        error: `Question ${i + 1} is set to Multiple Choice but only has 1 correct answer`,
      };
    }

    const exported = {
      question: text,
      options: trimmedOptions,
      correctAnswer: q.type === 'multi' ? correctIndices : correctIndices[0],
    };
    if (q.explanation.trim()) exported.explanation = q.explanation.trim();
    if (q.noShuffleOptions) exported.shuffle = 0;

    built.push(exported);
  }

  if (built.length < 2) {
    return { error: 'A quiz must contain at least 2 questions' };
  }

  return { data: { questions: built } };
}
