const API_BASE = "http://localhost:5000";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", loadLeaderboard);

async function loadLeaderboard() {

    try {

        const res = await fetch(`${API_BASE}/api/brain/leaderboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!data.success) return;

        renderLeaderboard(data.leaderboard);

    } catch (err) {
        console.error("Leaderboard Error:", err);
    }
}

function renderLeaderboard(players) {

    const container = document.getElementById("leaderboardContainer");
    container.innerHTML = "";

    players.forEach((player, index) => {

        const div = document.createElement("div");

        let rankClass = "";
        if (index === 0) rankClass = "rank-1";
        if (index === 1) rankClass = "rank-2";
        if (index === 2) rankClass = "rank-3";

        div.className = `leaderboard-card ${rankClass}`;

        div.innerHTML = `
            <h3>#${index + 1} - ${player.user?.name || "User"}</h3>
            <p>XP: ${player.xp}</p>
            <p>Level: ${player.level}</p>
            <p>Intelligence: ${player.intelligenceScore}</p>
        `;

        container.appendChild(div);
    });
}
