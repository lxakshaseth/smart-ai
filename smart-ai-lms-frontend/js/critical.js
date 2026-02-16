// =====================================================
// 🧠 SMART AI LMS – CRITICAL THINKING ENGINE (PRO AI)
// =====================================================

const API_BASE = "http://localhost:5000";
const token = localStorage.getItem("token");

let brainScore = 0;
let brainLevel = 1;
let difficulty = "normal";
let currentTimer = null;
let questionLocked = false;
let currentCorrectAnswer = null;


// =====================================================
// INIT
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    loadBrainStats();
});


// =====================================================
// LOAD BRAIN STATS
// =====================================================

async function loadBrainStats() {
    try {

        const res = await fetch(`${API_BASE}/api/brain/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!data.success) return;

        const summary = data.summary;

        brainScore = summary.xp || 0;
        brainLevel = summary.level || 1;

        if (summary.accuracy >= 80) difficulty = "hard";
        else if (summary.accuracy >= 50) difficulty = "normal";
        else difficulty = "easy";

        updateUIStats(summary);

    } catch (err) {
        console.error("Brain Load Error:", err);
    }
}


// =====================================================
// UPDATE UI
// =====================================================

function updateUIStats(summary = null) {

    document.getElementById("brainScore").innerText = brainScore;
    document.getElementById("brainLevel").innerText = brainLevel;

    if (!summary) return;

    document.getElementById("brainAccuracy").innerText =
        (summary.accuracy || 0) + "%";

    document.getElementById("brainStreak").innerText =
        summary.currentStreak || 0;

    document.getElementById("brainBadges").innerText =
        summary.badges?.length
            ? summary.badges.join(" | ")
            : "No badges yet";
}


// =====================================================
// SAVE XP
// =====================================================

async function saveXP(correct) {

    const res = await fetch(`${API_BASE}/api/brain/update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ correct, difficulty })
    });

    const data = await res.json();
    if (!data.success) return;

    brainScore = data.stats.xp;
    brainLevel = data.stats.level;

    updateUIStats({
        accuracy: data.stats.accuracy,
        currentStreak: data.stats.currentStreak,
        badges: data.stats.badges
    });
}


// =====================================================
// REWARD SYSTEM
// =====================================================

function reward(correct) {

    if (questionLocked) return;

    questionLocked = true;
    clearInterval(currentTimer);

    if (correct) {
        showMessage("✅ Correct!");
        saveXP(true);
    } else {
        showMessage("❌ Wrong!");
        saveXP(false);
    }

    setTimeout(() => {
        questionLocked = false;
    }, 1500);
}


// =====================================================
// TIMER
// =====================================================

function startTimer(seconds) {

    const timerEl = document.getElementById("brainTimer");
    let time = seconds;

    timerEl.innerText = time;

    clearInterval(currentTimer);

    currentTimer = setInterval(() => {

        time--;
        timerEl.innerText = time;

        if (time <= 0) {
            clearInterval(currentTimer);
            showMessage("⏰ Time Up!");
            questionLocked = true;
        }

    }, 1000);
}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(msg) {

    const container = document.getElementById("gameContainer");

    const msgDiv = document.createElement("div");
    msgDiv.className = "brain-message";
    msgDiv.innerText = msg;

    container.appendChild(msgDiv);

    setTimeout(() => msgDiv.remove(), 2000);
}


// =====================================================
// GAME ENGINE
// =====================================================

async function startGame(type) {

    const container = document.getElementById("gameContainer");
    container.innerHTML = "Loading...";
    clearInterval(currentTimer);

    questionLocked = false;
    currentCorrectAnswer = null;

    try {

        // ================= AI QUESTION =================

        if (["logic", "pattern", "rapid"].includes(type)) {

            const res = await fetch(`${API_BASE}/api/brain/question`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            if (!data.success) return;

            const { logic, math } = data.questions;

            if (type === "logic") {

                currentCorrectAnswer = logic.answer;
                startTimer(15);

                container.innerHTML = `
                    <h2>Logical Reasoning</h2>
                    <p>${logic.question}</p>
                    <button onclick="reward(true)">Yes</button>
                    <button onclick="reward(false)">No</button>
                `;
            }

            if (type === "pattern" || type === "rapid") {

                currentCorrectAnswer = math.answer;
                startTimer(type === "rapid" ? 10 : 20);

                container.innerHTML = `
                    <h2>${type === "rapid" ? "Rapid Thinking" : "Pattern Recognition"}</h2>
                    <p>${math.question}</p>
                    <input id="answerInput" />
                    <button onclick="checkAnswer()">Submit</button>
                `;
            }
        }

        // ================= MEMORY =================

        if (type === "memory") {

            const number = Math.floor(10000 + Math.random() * 90000);
            currentCorrectAnswer = number;

            startTimer(8);

            container.innerHTML = `
                <h2>Memory Booster</h2>
                <h3 id="mem">${number}</h3>
                <input id="answerInput" placeholder="Enter number"/>
                <button onclick="checkAnswer()">Submit</button>
            `;

            setTimeout(() => {
                document.getElementById("mem").innerText = "?????";
            }, 3000);
        }

        // ================= STRATEGY =================

        if (type === "strategy") {

            container.innerHTML = `
                <h2>Strategy Game</h2>
                <button onclick="runStrategy('Safe Strategy')">Safe Strategy</button>
                <button onclick="runStrategy('High Risk Strategy')">High Risk</button>
                <div id="strategyResult"></div>
            `;
        }

        // ================= DECISION =================

        if (type === "decision") {

            container.innerHTML = `
                <h2>Decision Simulator</h2>
                <button onclick="runDecision('Revise weak topics')">Revise Weak Topics</button>
                <button onclick="runDecision('Play games')">Play Games</button>
                <div id="decisionResult"></div>
            `;
        }

        // ================= CODE LAB (UPGRADED) =================

        if (type === "code") {

            container.innerHTML = `
                <h2>AI Code Lab</h2>
                <textarea id="codeInput" rows="6" style="width:100%;"></textarea>
                <button onclick="analyzeCode()">Analyze</button>
                <pre id="codeOutput"></pre>
            `;
        }

    } catch (err) {
        console.error("Game Load Error:", err);
        container.innerHTML = "Failed to load game.";
    }
}


// =====================================================
// CHECK ANSWER
// =====================================================

function checkAnswer() {

    const input = document.getElementById("answerInput");
    if (!input) return;

    const value = parseInt(input.value);
    reward(value === currentCorrectAnswer);
}


// =====================================================
// STRATEGY AI
// =====================================================

async function runStrategy(choice) {

    const resultDiv = document.getElementById("strategyResult");
    resultDiv.innerText = "Analyzing...";

    const res = await fetch(`${API_BASE}/api/brain/strategy`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ choice })
    });

    const data = await res.json();

    if (!data.success) {
        resultDiv.innerText = "Failed.";
        return;
    }

    resultDiv.innerText =
        `${data.scenario}\n\nXP +${data.xpEarned}`;

    loadBrainStats();
}


// =====================================================
// DECISION AI
// =====================================================

async function runDecision(decision) {

    const resultDiv = document.getElementById("decisionResult");
    resultDiv.innerText = "Analyzing...";

    const res = await fetch(`${API_BASE}/api/brain/decision`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decision })
    });

    const data = await res.json();

    if (!data.success) {
        resultDiv.innerText = "Failed.";
        return;
    }

    resultDiv.innerText =
        `${data.result.result}\nImpact Score: ${data.result.impactScore}`;
}


// =====================================================
// CODE LAB (ERROR + QUALITY VERSION)
// =====================================================

async function analyzeCode() {

    const code = document.getElementById("codeInput").value;
    const output = document.getElementById("codeOutput");

    output.innerText = "Analyzing...";

    const res = await fetch(`${API_BASE}/api/brain/code-lab`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (!data.success) {
        output.innerText = "Analysis failed.";
        return;
    }

    output.innerText = `
🧠 Explanation:
${data.explanation}

${data.hasError ? "❌ Errors:\n" + data.errors : "✅ No Errors Found"}

⭐ Code Quality Score: ${data.qualityScore}/10

🚀 Optimized Version:
${data.optimizedVersion}
`;

    // XP only if no syntax error
    if (!data.hasError) {
        saveXP(true);
    }
}


// =====================================================
// LEADERBOARD
// =====================================================

async function loadLeaderboard() {

    const modal = document.getElementById("leaderboardModal");
    const list = document.getElementById("leaderboardList");

    modal.style.display = "flex";
    list.innerHTML = "Loading...";

    const res = await fetch(`${API_BASE}/api/brain/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!data.success) {
        list.innerHTML = "Failed.";
        return;
    }

    list.innerHTML = "";

    data.leaderboard.forEach((player, index) => {
        list.innerHTML += `
            <p>
                ${index + 1}. ${player.user?.name || "User"} 
                — XP: ${player.xp} 
                — Level: ${player.level}
            </p>
        `;
    });
}
