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

        if (
            typeof q.question !== 'string' ||
            !q.question.trim() ||
            !q.options ||
            !Array.isArray(q.options) ||
            q.correctAnswer === undefined
        ) {
            return `Invalid question format at index ${i}`;
        }
        if (q.options.length < 2) {
            return `Question ${i} must have at least 2 options`;
        }
        if (q.options.some(option => typeof option !== 'string' || !option.trim())) {
            return `Question ${i} has an invalid option`;
        }

        const isMulti = Array.isArray(q.correctAnswer);
        const isValidAnswerIndex = (idx) =>
            Number.isInteger(idx) && idx >= 0 && idx < q.options.length;

        if (isMulti) {
            if (q.correctAnswer.length === 0) return `Question ${i} must have at least one correct answer`;
            const seen = new Set();
            for (let idx of q.correctAnswer) {
                if (!isValidAnswerIndex(idx)) {
                    return `Invalid index ${idx} in correctAnswer for question ${i}`;
                }
                if (seen.has(idx)) {
                    return `Duplicate index ${idx} in correctAnswer for question ${i}`;
                }
                seen.add(idx);
            }
        } else {
            // Single choice validation
            if (!isValidAnswerIndex(q.correctAnswer)) {
                return `Invalid correctAnswer index for question ${i}`;
            }
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

        // Handle remapping for both single (number) and multi (array) answers
        let newCorrectAnswer;
        
        if (Array.isArray(q.correctAnswer)) {
            // Remap all indices for multiple choice and keep them sorted
            newCorrectAnswer = q.correctAnswer.map(oldIdx => 
                shuffled.findIndex(item => item.originalIndex === oldIdx)
            ).sort((a, b) => a - b);
        } else {
            // Standard single choice remapping
            newCorrectAnswer = shuffled.findIndex(
                (item) => item.originalIndex === q.correctAnswer
            );
        }

        return {
            ...q,
            options: shuffled.map((item) => item.option),
            correctAnswer: newCorrectAnswer // Use the new variable
        };
    });

    return { ...data, questions: processedQuestions };
}

// Triggers a browser download of the quiz JSON. Content is identical for
// both extensions; only the filename changes.
export function downloadQuizFile(quizData, rawName, extension) {
    const trimmed = (rawName || '').trim();
    // Strip filesystem-forbidden characters; keep spaces/dots so user-typed
    // names look natural after download.
    const safeName = trimmed.replace(/[/\\:*?"<>|]/g, '_') || 'quiz';
    const json = JSON.stringify(quizData, null, 2);
    const mime = extension === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([json], { type: mime });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function calculateQuestionScore(question, userAnswer) {
    if (userAnswer === undefined || userAnswer === null) return 0;

    // Determine if Multi-choice (Array with >1 correct options)
    const correctArr = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
    const isMulti = correctArr.length > 1;

    if (!isMulti) {
        // --- Single Choice Rule (1 point or 0) ---
        const correctVal = correctArr[0];
        // Handle case where user answer might be wrapped in array or raw value
        const userVal = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
        return userVal === correctVal ? 1 : 0;
    } else {
        // --- Multi Choice Rule (F1 Score) ---
        // C = Ground Truth Count
        const C = correctArr.length;
        
        // S = User Selection Count
        const userArr = [...new Set(Array.isArray(userAnswer) ? userAnswer : [userAnswer])];
        const S = userArr.length;

        if (S === 0) return 0;

        // T = True Positives (Intersection)
        // Ensure we compare numbers correctly
        const T = userArr.filter(ans => correctArr.includes(ans)).length;

        const precision = T / S;
        const recall = T / C;

        if (precision + recall === 0) return 0;

        // F1 Formula
        return (2 * precision * recall) / (precision + recall);
    }
}
