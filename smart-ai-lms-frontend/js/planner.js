// =====================================================
// 📅 STUDY PLANNER SCRIPT - SMART AI LMS (ULTIMATE FINAL)
// =====================================================

const API_BASE = "http://localhost:5000";
const token = localStorage.getItem("token");

// =====================================================
// INIT
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    await loadPlanner();
    await loadAIControlPanel();

    document
        .getElementById("generateSmartPlanBtn")
        ?.addEventListener("click", generateSmartPlan);

    document
        .getElementById("refreshAIBtn")
        ?.addEventListener("click", loadAIControlPanel);

    document
        .getElementById("applyRecommendationBtn")
        ?.addEventListener("click", applyRecommendation);
});


// =====================================================
// LOAD PLANNER
// =====================================================

async function loadPlanner() {

    try {

        const res = await fetch(`${API_BASE}/api/planner`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Planner fetch failed");

        const data = await res.json();
        if (!data.success) return;

        const planner = data.planner;

        renderTasks(planner.weeklyPlan || []);
        updateStats(planner);

    } catch (err) {
        console.error("Planner Load Error:", err);
        showToast("Planner failed to load", "error");
    }
}


// =====================================================
// GENERATE SMART PLAN
// =====================================================

async function generateSmartPlan() {

    try {

        const btn = document.getElementById("generateSmartPlanBtn");
        if (btn) btn.innerText = "Generating...";

        const res = await fetch(`${API_BASE}/api/planner/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Generation failed");

        const data = await res.json();
        if (!data.success) throw new Error("Generation failed");

        showToast("✅ Smart Plan Generated", "success");

        await loadPlanner();
        await loadAIControlPanel();

    } catch (err) {
        console.error("Smart Plan Error:", err);
        showToast("❌ Failed to Generate Plan", "error");
    } finally {
        const btn = document.getElementById("generateSmartPlanBtn");
        if (btn) btn.innerText = "Generate Smart Plan";
    }
}


// =====================================================
// APPLY RECOMMENDATION
// =====================================================

async function applyRecommendation() {

    try {

        const btn = document.getElementById("applyRecommendationBtn");
        if (btn) btn.innerText = "Applying...";

        const res = await fetch(`${API_BASE}/api/planner/apply-recommendation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Apply failed");

        const data = await res.json();
        if (!data.success) throw new Error("Apply failed");

        showToast("🚀 AI Optimization Applied!", "success");

        await loadPlanner();
        await loadAIControlPanel();

    } catch (err) {
        console.error("Apply Recommendation Error:", err);
        showToast("❌ Failed To Apply Recommendation", "error");
    } finally {
        const btn = document.getElementById("applyRecommendationBtn");
        if (btn) btn.innerText = "🚀 Apply Smart Recommendation";
    }
}


// =====================================================
// LOAD AI CONTROL PANEL (FIXED)
// =====================================================

async function loadAIControlPanel() {

    try {

        const res = await fetch(`${API_BASE}/api/analytics/overview`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Analytics failed");

        const data = await res.json();
        if (!data.success) return;

        // Risk
        setText("riskText", data.riskLevel || "-");

        // Focus Score
        const focusScore = data.focusScore || 0;
        setText("goalText", `Focus Score: ${focusScore}`);

        // Progress bar
        const completion = data.weeklyCompletion || 0;
        document.getElementById("progressFill").style.width =
            `${completion}%`;

        // 🔥 AI Suggestion (NOW FIXED)
        const suggestion = generateAISuggestion(data);
        setText("aiSuggestion", suggestion);

    } catch (err) {
        console.error("AI Panel Error:", err);
        setText("aiSuggestion", "⚠ AI analysis failed.");
    }
}


// =====================================================
// AI SUGGESTION ENGINE (Frontend Version)
// =====================================================

function generateAISuggestion(data) {

    if (data.riskLevel === "High")
        return "⚠ High risk detected. Prioritize weak subjects.";

    if (data.performanceTrend === "Improving")
        return "🚀 Performance improving. Maintain consistency.";

    if (data.confidenceLevel === "Low")
        return "📉 Confidence low. Increase mock practice.";

    return "✅ Stable progress. Continue current plan.";
}


// =====================================================
// RENDER TASKS
// =====================================================

function renderTasks(weeklyPlan) {

    const container = document.getElementById("tasksContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!weeklyPlan.length) {
        container.innerHTML = "No tasks available.";
        return;
    }

    weeklyPlan.forEach((day, dayIndex) => {

        const dayTitle = document.createElement("h4");
        dayTitle.innerText = day.day || `Day ${dayIndex + 1}`;
        dayTitle.style.marginTop = "15px";
        container.appendChild(dayTitle);

        (day.tasks || []).forEach((task, taskIndex) => {

            const div = document.createElement("div");
            div.className = "task-item";

            div.innerHTML = `
                <span>${task.subject || ""} - ${task.topic || ""}</span>
                <input type="checkbox"
                    ${task.completed ? "checked" : ""}
                    data-day="${dayIndex}"
                    data-task="${taskIndex}"
                />
            `;

            container.appendChild(div);
        });
    });

    attachToggleEvents();
}


// =====================================================
// TASK TOGGLE HANDLER
// =====================================================

function attachToggleEvents() {

    document.querySelectorAll(".task-item input")
        .forEach(input => {

            input.addEventListener("change", async function () {

                const dayIndex = parseInt(this.dataset.day);
                const taskIndex = parseInt(this.dataset.task);

                try {

                    const res = await fetch(`${API_BASE}/api/planner/complete`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            dayIndex,
                            taskIndex
                        })
                    });

                    if (!res.ok) throw new Error("Toggle failed");

                    const data = await res.json();
                    if (!data.success) throw new Error("Toggle failed");

                    await loadPlanner();
                    await loadAIControlPanel();

                } catch (err) {
                    console.error("Toggle Error:", err);
                    showToast("❌ Task update failed", "error");
                }
            });
        });
}


// =====================================================
// UPDATE STATS
// =====================================================

function updateStats(planner) {

    setText("weeklyCompletion", planner.weeklyCompletion || 0);
    setText("studyStreak", planner.studyStreak || 0);
    setText("weakSubject", planner.weakSubject || "-");
}


// =====================================================
// UTIL
// =====================================================

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}


// =====================================================
// TOAST
// =====================================================

function showToast(message, type = "success") {

    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
