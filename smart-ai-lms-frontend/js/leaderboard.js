const token = localStorage.getItem("token");
if (!token) window.location.href = "/login";

async function loadLeaderboard() {

    const res = await fetch("/api/leaderboard", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    const data = await res.json();

    if (!data.success) {
        alert("Failed to load leaderboard");
        return;
    }

    const container = document.getElementById("leaderboardList");
    container.innerHTML = "";

    data.leaderboard.forEach((user, index) => {

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>#${index + 1} ${user.username}</h3>
            <p>XP: ${user.xp}</p>
            <p>Level: ${user.level}</p>
            <p>Rank: ${user.rank}</p>
        `;

        container.appendChild(div);
    });

    document.getElementById("yourRank").innerText = data.yourPosition;
}

loadLeaderboard();
