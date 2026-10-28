// StudyMate AI - JavaScript Prototype
let currentTool = "summary";

// Select a study tool
function openTool(tool) {
    currentTool = tool;

    const titles = {
        summary: "📝 Notes Summarizer",
        mcq: "🧠 MCQ Generator",
        questions: "📚 Important Questions",
        planner: "📅 Study Planner"
    };

    const descriptions = {
        summary: "Convert your notes into short revision points.",
        mcq: "Create practice questions from your notes.",
        questions: "Generate revision questions from your notes.",
        planner: "Organize your study schedule."
    };

    document.getElementById("workspace-title").textContent = titles[tool];
    document.getElementById("workspace-description").textContent =
        descriptions[tool];

    document.getElementById("workspace").scrollIntoView({
        behavior: "smooth"
    });

    const result = document.getElementById("result");

    result.textContent = "Paste your study notes above to get started.";

    const button = document.getElementById("generate-btn");

    if (tool === "summary") {
        button.textContent = "Summarize Notes ✨";
    } else if (tool === "mcq") {
        button.textContent = "Generate MCQs ✨";
    } else if (tool === "questions") {
        button.textContent = "Generate Questions ✨";
    } else {
        button.textContent = "Generate Result ✨";
    }
}

// Convert notes into sentences
function getSentences(text) {
    return text
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 15);
}

// Display text safely
function showResult(title, items) {
    const result = document.getElementById("result");

    result.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = title;
    result.appendChild(heading);

    if (!items.length) {
        const message = document.createElement("p");
        message.textContent =
            "Not enough information. Please add more detailed notes.";
        result.appendChild(message);
        return;
    }

    const list = document.createElement("ul");

    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });

    result.appendChild(list);
}

// Notes summarizer
function summarizeNotes(text) {
    const sentences = getSentences(text);

    if (sentences.length === 0) {
        return [];
    }

    // Simple prototype: select sentences from the notes.
    const summarySize = Math.max(1, Math.ceil(sentences.length / 3));

    return sentences.slice(0, summarySize);
}

// Create practice MCQs from notes
function generateMCQs(text) {
    const sentences = getSentences(text);
    const questions = [];

    sentences.forEach((sentence, index) => {
        const words = sentence.match(/\b[A-Za-z][A-Za-z-]*\b/g) || [];

        if (words.length < 5) {
            return;
        }

        const answer = words.find(word => word.length >= 5);

        if (!answer) {
            return;
        }

        const questionText = sentence.replace(
            new RegExp("\\b" + answer + "\\b", "i"),
            "______"
        );

        const distractors = [...new Set(
            words.filter(word =>
                word.toLowerCase() !== answer.toLowerCase() &&
                word.length >= 4
            )
        )].slice(0, 3);

        if (distractors.length < 3) {
            return;
        }

        const options = [answer, ...distractors];

        // Deterministic shuffle for the prototype
        for (let i = options.length - 1; i > 0; i--) {
            const j = (index + i) % (i + 1);
            [options[i], options[j]] = [options[j], options[i]];
        }

        questions.push({
            question: questionText,
            options,
            answer
        });
    });

    return questions.slice(0, 10);
}

// Display MCQs with answer checking
function displayMCQs(questions) {
    const result = document.getElementById("result");
    result.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "🧠 Practice MCQs";
    result.appendChild(heading);

    if (!questions.length) {
        const message = document.createElement("p");
        message.textContent =
            "Please paste longer notes containing complete sentences.";
        result.appendChild(message);
        return;
    }

    const feedback = document.createElement("p");
    feedback.setAttribute("aria-live", "polite");

    questions.forEach((question, index) => {
        const container = document.createElement("div");
        container.style.marginBottom = "24px";

        const title = document.createElement("p");
        title.style.fontWeight = "700";
        title.textContent = '${index + 1} ${question.question}';
        container.appendChild(title);

        question.options.forEach(option => {
            const label = document.createElement("label");
            label.style.display = "block";
            label.style.margin = "8px 0";
            label.style.cursor = "pointer";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `question-${index}`;
            radio.value = option;
            radio.style.marginRight = "8px";

            label.appendChild(radio);
            label.appendChild(document.createTextNode(option));
            container.appendChild(label);
        });

        result.appendChild(container);
    });

    const checkButton = document.createElement("button");
    checkButton.className = "primary-btn";
    checkButton.textContent = "Check My Answers";

    checkButton.addEventListener("click", () => {
        let score = 0;

        questions.forEach((question, index) => {
            const selected = document.querySelector(
                `input[name="question-${index}"]:checked`
            );

            if (
                selected &&
                selected.value.toLowerCase() === question.answer.toLowerCase()
            ) {
                score++;
            }
        });

        feedback.textContent = `Your score: ${score} out of ${questions.length}`;

        checkButton.insertAdjacentElement("afterend", feedback);
    });

    result.appendChild(checkButton);
}

// Generate revision questions
function generateImportantQuestions(text) {
    const sentences = getSentences(text);

    return sentences.slice(0, 8).map(sentence => {
        const cleanSentence = sentence.replace(/[.!?]+$/, "");
        return `Explain the following: ${cleanSentence}?`;
    });
}

// Main button handler
function processNotes() {
    const text = document.getElementById("notes-input").value.trim();

    if (currentTool === "planner") {
        document.getElementById("planner").scrollIntoView({
            behavior: "smooth"
        });
        return;
    }

    if (!text) {
        showResult("Notes Required", [
            "Please paste your study notes in the text box first."
        ]);
        return;
    }

    if (currentTool === "summary") {
        showResult("📝 Your Summary", summarizeNotes(text));
    } else if (currentTool === "mcq") {
        displayMCQs(generateMCQs(text));
    } else if (currentTool === "questions") {
        showResult(
            "📚 Important Revision Questions",
            generateImportantQuestions(text)
        );
    }
}

// Clear the workspace
function clearWorkspace() {
    document.getElementById("notes-input").value = "";

    const result = document.getElementById("result");
    result.textContent = "Your results will appear here.";
}

// Study planner
document.getElementById("planner-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const subject = document.getElementById("subject").value.trim();
    const hours = Number(document.getElementById("study-hours").value);
    const examDate = document.getElementById("exam-date").value;

    if (!subject || !examDate || hours < 1 || hours > 16) {
        alert("Please enter valid study details.");
        return;
    }

    // Use local calendar dates to avoid timezone errors.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exam = new Date(examDate + "T00:00:00");
    const daysLeft = Math.round(
        (exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const result = document.getElementById("plan-result");
    result.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "📅 Your Study Plan";
    result.appendChild(heading);

    const message = document.createElement("p");

    if (daysLeft < 0) {
        message.textContent =
            "Your exam date is in the past. Please select a future date.";
        result.appendChild(message);
        return;
    }

    const totalHours = daysLeft * hours;

    message.textContent =
        `Subject: ${subject}. You have ${daysLeft} day(s) until your exam. ` +
        `Study ${hours} hour(s) daily. Your planned study time before the exam ` +
        `is approximately ${totalHours} hour(s), excluding today.`;

    result.appendChild(message);

    const tip = document.createElement("p");
    tip.textContent =
        "Tip: Divide your time between learning concepts, practicing questions, and revising.";
    result.appendChild(tip);
});

// Set a sensible default exam date.
const examInput = document.getElementById("exam-date");

if (examInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");

    examInput.min = `${year}-${month}-${day}`;
    examInput.value = `${year}-${month}-${day}`;
}