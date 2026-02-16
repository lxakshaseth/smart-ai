const token = localStorage.getItem("token");
const API_BASE = "http://localhost:5000/api";

if (!token) {
  window.location.href = "login.html";
}

// =====================================
// LOAD DASHBOARD DATA
// =====================================
async function loadDashboard() {

  try {

    const res = await fetch(`${API_BASE}/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    renderGoal(data);
    renderCompletion(data);
    renderAISuggestions(data);
    renderTomorrow(data);

  } catch (err) {
    console.error(err);
  }
}

loadDashboard();

// =====================================
// GOAL TRACKER
// =====================================
function renderGoal(data) {

  const progress = data.xp % 100;
  const risk = progress < 40 ? "High" : progress < 70 ? "Medium" : "Low";

  document.getElementById("goalContent").innerHTML = `
    <div>Level: ${data.level}</div>
    <div>XP: ${data.xp}</div>

    <div class="risk-meter">
      <div class="risk-fill" style="width:${progress}%"></div>
    </div>

    <div>Risk Level: ${risk}</div>
  `;
}

// =====================================
// COMPLETION
// =====================================
function renderCompletion(data) {

  document.getElementById("completionStats").innerHTML = `
    <div>Weekly Completion: ${data.weeklyCompletion || 0}%</div>
    <div>Study Streak: ${data.streak} 🔥</div>
    <div>Weak Subject: ${data.weakSubject || "N/A"}</div>
  `;
}

// =====================================
// AI SUGGESTIONS
// =====================================
function renderAISuggestions(data) {

  let suggestion = "";

  if (data.streak < 3) {
    suggestion = "Increase daily consistency. Aim minimum 2 focused sessions.";
  } else if (data.xp < 200) {
    suggestion = "Add 2 mock tests this week to improve performance.";
  } else {
    suggestion = "Maintain momentum. Add advanced practice blocks.";
  }

  document.getElementById("aiSuggestions").innerHTML = `
    <p>${suggestion}</p>
  `;
}

// =====================================
// TOMORROW PLAN
// =====================================
function renderTomorrow(data) {

  document.getElementById("tomorrowFocus").innerHTML = `
    <p>• Revise weak subject</p>
    <p>• Practice 20 MCQs</p>
    <p>• 1 mock test analysis</p>
  `;
}
