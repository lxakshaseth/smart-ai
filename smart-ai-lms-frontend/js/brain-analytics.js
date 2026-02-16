const API_BASE = "http://localhost:5000";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", loadAnalytics);

async function loadAnalytics() {

    try {

        const res = await fetch(`${API_BASE}/api/brain/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!data.success) return;

        const stats = data.summary;

        document.getElementById("xpStat").innerText = stats.xp;
        document.getElementById("levelStat").innerText = stats.level;
        document.getElementById("accuracyStat").innerText = stats.accuracy + "%";
        document.getElementById("iqStat").innerText = stats.intelligenceScore;
        document.getElementById("streakStat").innerText = stats.currentStreak;
        document.getElementById("bestStreakStat").innerText = stats.bestStreak;

        renderXPChart(stats.xp);

    } catch (err) {
        console.error("Analytics Error:", err);
    }
}

function renderXPChart(currentXP) {

    const ctx = document.getElementById("xpChart");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Start", "Mid", "Now"],
            datasets: [{
                data: [0, currentXP / 2, currentXP],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.3)",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}
