const token = localStorage.getItem("token");
const API_URL = "http://localhost:5000/api/mocktest";

let currentQuestions = [];

// =======================================
// CHECK LOGIN
// =======================================
if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
}

// =======================================
// GENERATE TEST
// =======================================
async function generateTest() {

    const subject = document.getElementById("subject").value.trim();
    const topic = document.getElementById("topic").value.trim();

    if (!subject || !topic) {
        alert("Enter subject and topic");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ subject, topic })
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Failed to generate test");
        }

        const data = await res.json();

        currentQuestions = data.questions;
        renderQuestions();

    } catch (err) {
        console.error("Generate Error:", err);
        alert(err.message || "Error generating test");
    }
}

// =======================================
// RENDER QUESTIONS
// =======================================
function renderQuestions() {

    const container = document.getElementById("testContainer");
    container.innerHTML = "";

    currentQuestions.forEach((q, index) => {

        const div = document.createElement("div");
        div.className = "question-card";
        div.style.marginBottom = "20px";

        div.innerHTML = `
            <p><b>Q${index + 1}. ${q.question}</b></p>
            ${q.options.map(opt => `
                <label>
                    <input type="radio" name="q${index}" value="${opt}">
                    ${opt}
                </label><br>
            `).join("")}
        `;

        container.appendChild(div);
    });

    document.getElementById("submitBtn").style.display = "block";
    document.getElementById("resultContainer").innerHTML = "";
}

// =======================================
// SUBMIT TEST
// =======================================
async function submitTest() {

    let score = 0;
    let weakAreas = [];

    currentQuestions.forEach((q, index) => {

        const selected = document.querySelector(`input[name="q${index}"]:checked`);

        if (selected && selected.value === q.answer) {
            score++;
        } else {
            weakAreas.push(q.question);
        }
    });

    const total = currentQuestions.length;
    const percent = Math.round((score / total) * 100);

    // Show basic result immediately
    document.getElementById("resultContainer").innerHTML = `
        <h2>Result</h2>
        <p>Score: ${score} / ${total}</p>
        <p>Accuracy: ${percent}%</p>
        <p>Submitting result...</p>
    `;

    try {

        const res = await fetch(`${API_URL}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                subject: document.getElementById("subject").value,
                topic: document.getElementById("topic").value,
                totalQuestions: total,
                correctAnswers: score,
                weakAreas
            })
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Failed to submit test");
        }

        const data = await res.json();

        // Final result with XP info
        document.getElementById("resultContainer").innerHTML = `
            <h2>Result</h2>
            <p>Score: ${score} / ${total}</p>
            <p>Accuracy: ${percent}%</p>
            <hr>
            <p>XP Earned: <b>${data.xpEarned}</b></p>
            <p>Level: <b>${data.level}</b></p>
            <p>Rank: <b>${data.rank}</b></p>
        `;

    } catch (err) {
        console.error("Submit Error:", err);
        alert(err.message || "Failed to submit test");
    }
}
