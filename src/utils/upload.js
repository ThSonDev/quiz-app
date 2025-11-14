// --- shuffle array ---
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// --- validate JSON structure ---
export function validateQuizData(data) {
    if (!data.questions || !Array.isArray(data.questions)) {
        return 'Invalid format: missing "questions" array';
    }

    for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];

        if (!q.question || !q.options || !Array.isArray(q.options) || q.correctAnswer === undefined) {
            return `Invalid question format at index ${i}`;
        }
        if (q.options.length < 2) {
            return `Question ${i} must have at least 2 options`;
        }
        if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
            return `Invalid correctAnswer index for question ${i}`;
        }
    }

    return null;
}

// --- main processing logic ---
export function processQuizData(data, settings) {
    let processedQuestions = data.questions.map((q, idx) => ({
        ...q,
        originalIndex: idx
    }));

    if (settings.shuffleQuestions) {
        processedQuestions = shuffleArray(processedQuestions);
    }

    if (settings.quizSizeMode === "percentage" && settings.quizSize < 100) {
        const targetCount = Math.max(
            1,
            Math.ceil((settings.quizSize / 100) * processedQuestions.length)
        );
        processedQuestions = processedQuestions.slice(0, targetCount);
    } else if (settings.quizSizeMode === "count") {
        processedQuestions = processedQuestions.slice(0, settings.quizSize);
    }

    processedQuestions = processedQuestions.map((q) => {
        const shouldShuffle = settings.shuffleOptions && q.shuffle !== 0;
        if (!shouldShuffle) return q;

        const optionObjects = q.options.map((opt, idx) => ({
            option: opt,
            originalIndex: idx
        }));

        const shuffled = shuffleArray(optionObjects);

        const newCorrectIndex = shuffled.findIndex(
            (item) => item.originalIndex === q.correctAnswer
        );

        return {
            ...q,
            options: shuffled.map((item) => item.option),
            correctAnswer: newCorrectIndex
        };
    });

    return { ...data, questions: processedQuestions };
}
