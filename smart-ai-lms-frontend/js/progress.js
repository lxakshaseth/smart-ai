const API_BASE = "http://localhost:5000";

let plannerInitialized = false;
let currentPlanner = null;

/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (plannerInitialized) return;
    plannerInitialized = true;

    initPlanner();
});

async function initPlanner() {

    await loadPlanner();

    // Auto refresh if updated from Progress page
    if (localStorage.getItem("plannerUpdated") === "true") {
        localStorage.removeItem("plannerUpdated");
        await loadPlanner();
        showToast("🔄 Planner Updated From Analytics");
    }
}

/* =====================================================
   LOAD PLANNER
===================================================== */

async function loadPlanner() {

    const token = localStorage.getItem("token");
    if (!token) return;

    try {

        const res = await fetch(`${API_BASE}/api/planner`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!res.ok) throw new Error("Planner fetch failed");

        const data = await res.json();

        // Support both formats
        currentPlanner = data.planner || data;

        renderPlanner(currentPlanner);
        updateProgressBar(currentPlanner);

    } catch (err) {
        console.error("Planner Load Error:", err);
        showToast("❌ Failed To Load Planner", "error");
    }
}

/* =====================================================
   RENDER PLANNER
===================================================== */

function renderPlanner(planner) {

    const container = document.getElementById("plannerContainer");
    if (!container) return;

    if (!planner || !planner.weeklyPlan || !planner.weeklyPlan.length) {
        container.innerHTML = "<p>No study plan generated yet.</p>";
        return;
    }

    container.innerHTML = "";

    planner.weeklyPlan.forEach((day, dayIndex) => {

        const dayTitle = document.createElement("h3");
        dayTitle.style.margin = "20px 0 10px 0";
        dayTitle.innerText = day.day || `Day ${dayIndex + 1}`;
        container.appendChild(dayTitle);

        day.tasks.forEach((task, taskIndex) => {

            const taskDiv = document.createElement("div");
            taskDiv.classList.add("planner-task");

            taskDiv.innerHTML = `
                <div>
                    <h4>${task.subject}</h4>
                    <p>${task.topic}</p>
                    <small>Weight: ${task.weight || 1}</small>
                </div>
                <input type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${dayIndex}, ${taskIndex})">
            `;

            container.appendChild(taskDiv);
        });
    });
}

/* =====================================================
   TOGGLE TASK
===================================================== */

async function toggleTask(dayIndex, taskIndex) {

    const token = localStorage.getItem("token");
    if (!token) return;

    try {

        const res = await fetch(`${API_BASE}/api/planner/complete`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ dayIndex, taskIndex })
        });

        if (!res.ok) throw new Error("Toggle failed");

        showToast("✅ Task Updated");
        await loadPlanner();

    } catch (err) {
        console.error("Toggle Error:", err);
        showToast("❌ Failed To Update Task", "error");
    }
}

/* =====================================================
   PROGRESS BAR
===================================================== */

function updateProgressBar(planner) {

    const fill = document.getElementById("plannerProgressFill");
    if (!fill || !planner?.weeklyPlan) return;

    let total = 0;
    let completed = 0;

    planner.weeklyPlan.forEach(day => {
        day.tasks.forEach(task => {
            total++;
            if (task.completed) completed++;
        });
    });

    const percentage = total ? (completed / total) * 100 : 0;

    fill.style.width = percentage + "%";
}

/* =====================================================
   GENERATE AI PLAN
===================================================== */

async function generateAIPlan() {

    const token = localStorage.getItem("token");
    if (!token) return;

    try {

        const res = await fetch(`${API_BASE}/api/planner/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) throw new Error("Generate failed");

        showToast("🤖 AI Plan Generated");
        await loadPlanner();

    } catch (err) {
        console.error("Generate Error:", err);
        showToast("❌ Failed To Generate Plan", "error");
    }
}

/* =====================================================
   SMART TOMORROW PLAN
===================================================== */

document.addEventListener("click", async (e) => {

    if (e.target.id !== "generateTomorrowBtn") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {

        const res = await fetch(`${API_BASE}/api/planner/tomorrow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) throw new Error("Tomorrow plan failed");

        showToast("🧠 Tomorrow Smart Plan Created!");
        await loadPlanner();

    } catch (err) {
        console.error(err);
        showToast("❌ Server Error", "error");
    }
});

/* =====================================================
   SAVE MANUAL EDIT
===================================================== */

async function savePlanner(updatedPlan) {

    const token = localStorage.getItem("token");
    if (!token) return;

    try {

        const res = await fetch(`${API_BASE}/api/planner`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ weeklyPlan: updatedPlan })
        });

        if (!res.ok) throw new Error("Save failed");

        showToast("✅ Planner Saved");
        await loadPlanner();

    } catch (err) {
        console.error("Save Error:", err);
        showToast("❌ Failed To Save Planner", "error");
    }
}

/* =====================================================
   TOAST SYSTEM
===================================================== */

function showToast(message, type = "success") {

    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.position = "fixed";
        container.style.bottom = "30px";
        container.style.right = "30px";
        container.style.zIndex = "9999";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    toast.innerText = message;
    toast.style.padding = "12px 18px";
    toast.style.marginBottom = "10px";
    toast.style.borderRadius = "12px";
    toast.style.fontWeight = "600";
    toast.style.color = "white";
    toast.style.opacity = "0";
    toast.style.transition = "0.4s ease";
    toast.style.background =
        type === "error" ? "#ef4444" : "#22c55e";

    container.appendChild(toast);

    setTimeout(() => toast.style.opacity = "1", 100);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
