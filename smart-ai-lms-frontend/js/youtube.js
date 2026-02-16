// ================================
// SMART AI LMS - YOUTUBE MODULE
// ================================

const API_BASE = "http://localhost:5000/api/youtube";

// ================================
// SEARCH FUNCTION
// ================================
async function searchYT(topicFromHistory = null) {

    const input = document.getElementById("ytInput");
    const resultsContainer = document.getElementById("ytResults");
    const playerContainer = document.getElementById("playerContainer");

    let topic = topicFromHistory || input.value.trim();
    if (!topic) return;

    input.value = topic;

    saveHistory(topic);

    resultsContainer.innerHTML = "Loading videos...";
    playerContainer.innerHTML = "";

    try {

        const response = await fetch(
            `${API_BASE}/search?q=${encodeURIComponent(topic)}`
        );

        const data = await response.json();

        if (!data.success || !data.videos || data.videos.length === 0) {
            resultsContainer.innerHTML = "No videos found.";
            return;
        }

        renderVideos(data.videos);

    } catch (error) {
        console.error("YouTube Fetch Error:", error);
        resultsContainer.innerHTML = "Failed to fetch videos.";
    }
}


// ================================
// RENDER VIDEOS
// ================================
function renderVideos(videos) {

    const container = document.getElementById("ytResults");
    container.innerHTML = "";

    videos.forEach(video => {

        const card = document.createElement("div");
        card.className = "video-card";

        card.innerHTML = `
            <img src="${video.thumbnail}" />
            <h4>${video.videoId}</h4>
        `;

        card.addEventListener("click", () => {
            playVideo(video.videoId);
            incrementXP(2); // optional XP reward
        });

        container.appendChild(card);
    });
}


// ================================
// PLAY VIDEO
// ================================
function playVideo(videoId) {

    const player = document.getElementById("playerContainer");

    player.innerHTML = `
        <iframe width="800" height="450"
            src="https://www.youtube.com/embed/${videoId}"
            frameborder="0"
            allowfullscreen>
        </iframe>
    `;

    window.scrollTo({
        top: player.offsetTop,
        behavior: "smooth"
    });
}


// ================================
// SEARCH HISTORY
// ================================
function saveHistory(topic) {

    let history = JSON.parse(localStorage.getItem("ytHistory")) || [];

    history = history.filter(item => item !== topic);
    history.unshift(topic);
    history = history.slice(0, 10);

    localStorage.setItem("ytHistory", JSON.stringify(history));
    renderHistory();
}


function renderHistory() {

    const historyBox = document.getElementById("historyBox");
    let history = JSON.parse(localStorage.getItem("ytHistory")) || [];

    if (!historyBox) return;

    if (history.length === 0) {
        historyBox.innerHTML = "<p>No recent searches.</p>";
        return;
    }

    let html = "<h3>🔎 Recent Searches:</h3><ul>";

    history.forEach(item => {
        html += `
            <li style="cursor:pointer; margin:5px 0; color:#4da6ff;"
                onclick="searchYT('${item.replace(/'/g, "\\'")}')">
                ${item}
            </li>
        `;
    });

    html += "</ul>";

    historyBox.innerHTML = html;
}


function clearHistory() {
    localStorage.removeItem("ytHistory");
    renderHistory();
}


// ================================
// OPTIONAL XP SYSTEM (Future Ready)
// ================================
function incrementXP(points) {

    let xp = parseInt(localStorage.getItem("userXP")) || 0;
    xp += points;

    localStorage.setItem("userXP", xp);
}


// ================================
// INITIALIZE
// ================================
window.addEventListener("DOMContentLoaded", () => {
    renderHistory();
});
