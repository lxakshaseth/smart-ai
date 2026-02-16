const API_BASE = "http://localhost:5000";
let currentChatId = null;

// ============================
// PAGE LOAD
// ============================
window.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    await initializeChat();
});

// ============================
// INITIALIZE CHAT
// ============================
async function initializeChat() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_BASE}/api/ai/sessions`, {
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await res.json();

        if (!data.success || !data.sessions || data.sessions.length === 0) {
            await createNewChat();
        } else {
            renderSessions(data.sessions);
            await loadChat(data.sessions[0]._id);
        }

    } catch (error) {
        console.error("Initialization Error:", error);
    }
}

// ============================
// RENDER SESSIONS
// ============================
function renderSessions(sessions) {
    const sessionsDiv = document.getElementById("sessions");
    if (!sessionsDiv) return;

    sessionsDiv.innerHTML = "";

    sessions.forEach(session => {
        const div = document.createElement("div");
        div.className = "session-item";
        div.innerHTML = `
            <div onclick="loadChat('${session._id}')">
                ${session.title || "Chat"}
            </div>
        `;
        sessionsDiv.appendChild(div);
    });
}

// ============================
// LOAD CHAT
// ============================
async function loadChat(chatId) {
    currentChatId = chatId;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_BASE}/api/ai/chat/${chatId}`, {
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await res.json();
        if (!data.success) return;

        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = "";

        if (data.chat.messages) {
            data.chat.messages.forEach(msg => {
                addMessage(msg.content, msg.role);
            });
        }

        document.getElementById("tokenCount").innerText =
            data.chat.tokensUsed || 0;

    } catch (error) {
        console.error("Load Chat Error:", error);
    }
}

// ============================
// CREATE NEW CHAT
// ============================
async function createNewChat() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_BASE}/api/ai/new-chat`, {
            method: "POST",
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await res.json();

        if (data.success && data.chat) {
            currentChatId = data.chat._id;
            await initializeChat();
        }

    } catch (error) {
        console.error("Create Chat Error:", error);
    }
}

// ============================
// SEND MESSAGE
// ============================
async function sendMessage() {

    const input = document.getElementById("questionInput");
    const message = input.value.trim();

    if (!message || !currentChatId) return;

    addMessage(message, "user");
    input.value = "";

    showTyping();

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_BASE}/api/ai/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                chatId: currentChatId,
                question: message
            })
        });

        const data = await res.json();
        removeTyping();

        if (data.success) {
            addMessage(data.reply || data.answer, "assistant");
            loadAIRecommendations(message); // 🔥 Recommendation Trigger
        } else {
            addMessage("Error: " + data.message, "assistant");
        }

    } catch (error) {
        removeTyping();
        console.error("Send Message Error:", error);
        addMessage("Server Error", "assistant");
    }
}

// ============================
// ADD MESSAGE
// ============================
function addMessage(text, role) {
    const chatBox = document.getElementById("chatBox");

    const div = document.createElement("div");
    div.className = "message " + (role === "user" ? "user" : "ai");

    if (role === "assistant") {
        div.innerHTML = marked.parse(text);

        setTimeout(() => {
            div.querySelectorAll("pre code").forEach(block => {
                hljs.highlightElement(block);
            });
        }, 0);

    } else {
        div.innerText = text;
    }

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ============================
// TYPING DOTS
// ============================
function showTyping() {
    const chatBox = document.getElementById("chatBox");

    const div = document.createElement("div");
    div.id = "typing";
    div.className = "message ai typing";
    div.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
}

// ============================
// AI VIDEO RECOMMENDATION
// ============================
async function loadAIRecommendations(topic) {

    const section = document.getElementById("aiRecommendations");
    const grid = document.getElementById("recommendationGrid");
    const player = document.getElementById("recommendationPlayer");

    if (!section || !topic) return;

    section.style.display = "block";
    grid.innerHTML = "Loading...";
    player.innerHTML = "";

    try {
        const res = await fetch(
            `${API_BASE}/api/youtube/search?q=${encodeURIComponent(topic)}`
        );

        const data = await res.json();

        if (!data.success || !data.videos.length) {
            grid.innerHTML = "No recommendations found.";
            return;
        }

        grid.innerHTML = "";

        data.videos.slice(0, 6).forEach(video => {

            const card = document.createElement("div");
            card.className = "recommendation-card";

            card.innerHTML = `
                <img src="${video.thumbnail}" />
                <p>${video.videoId}</p>
            `;

            card.onclick = () => {
                player.innerHTML = `
                    <iframe width="800" height="450"
                        src="https://www.youtube.com/embed/${video.videoId}"
                        frameborder="0"
                        allowfullscreen>
                    </iframe>
                `;
                window.scrollTo({ top: player.offsetTop, behavior: "smooth" });
            };

            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Recommendation Error:", error);
        grid.innerHTML = "Failed to load recommendations.";
    }
}

// ============================
// EXPORT CHAT
// ============================
function exportChat() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const chatText = document.getElementById("chatBox").innerText;
    doc.text(chatText, 10, 10);
    doc.save("Chat_Export.pdf");
}
