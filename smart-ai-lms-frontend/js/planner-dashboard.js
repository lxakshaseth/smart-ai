const token = localStorage.getItem("token");
const API_URL = "http://localhost:5000/api/planner/dashboard";

window.addEventListener("DOMContentLoaded", loadDashboard);

async function loadDashboard() {
  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    updateUI(data);

  } catch (err) {
    console.error("Dashboard Load Error:", err);
  }
}

function updateUI(data) {
  // Goal Progress
  document.querySelector(".goal-progress-text").innerText =
    `Progress: ${data.progress}%`;

  const bar = document.querySelector(".goal-progress-bar-fill");
  bar.style.width = `${data.progress}%`;

  // Risk Level
  const riskText = document.querySelector(".risk-text");
  riskText.innerText = `Risk Level: ${data.riskLevel}`;

  if (data.riskLevel === "High") {
    riskText.style.color = "#ef4444";
  } else if (data.riskLevel === "Medium") {
    riskText.style.color = "#facc15";
  } else {
    riskText.style.color = "#22c55e";
  }

  // Weekly Completion
  document.querySelector(".weekly-completion").innerText =
    `Weekly Completion: ${data.weeklyCompletion}%`;

  // Streak
  document.querySelector(".streak-count").innerText =
    `${data.streak} Days`;

  // Weak Subject
  document.querySelector(".weak-subject").innerText =
    data.weakSubject || "-";

  // Today Tasks
  const taskContainer = document.querySelector(".today-task-list");
  taskContainer.innerHTML = "";

  data.todayTasks.forEach(task => {
    taskContainer.innerHTML += `
      <div class="task-item">
        <span>${task.title}</span>
        <button onclick="completeTask('${task.title}')">✅</button>
      </div>
    `;
  });

  // AI Suggestion
  document.querySelector(".ai-suggestion-text").innerText =
    data.aiSuggestion;
}

async function completeTask(day) {
  try {
    await fetch("http://localhost:5000/api/planner/complete", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ day })
    });

    loadDashboard();

  } catch (err) {
    console.error("Task Complete Error:", err);
  }
}
