const API_BASE = "http://localhost:5000";

/* =====================================================
   SEND MESSAGE (FIXED VERSION)
===================================================== */

async function sendMessage() {

    const input = document.getElementById("questionInput");
    const message = input.value.trim();
    if (!message) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first");
        return;
    }

    addMessage(message, "user-msg");
    localStorage.setItem("lastStudyTopic", message);
    input.value = "";

    let chatId = localStorage.getItem("chatId");

    try {

        /* ================= CREATE CHAT IF NOT EXIST ================= */

        if (!chatId) {

            const chatRes = await fetch(`${API_BASE}/api/ai/new-chat`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const chatData = await chatRes.json();

            if (!chatData.success || !chatData.chatId) {
                addMessage("Failed to create chat session.", "ai-msg");
                return;
            }

            chatId = chatData.chatId;
            localStorage.setItem("chatId", chatId);
        }

        /* ================= CALL AI ================= */

        const response = await fetch(`${API_BASE}/api/ai/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ chatId, question: message })
        });

        const data = await response.json();

        if (!data.success) {
            addMessage("AI Error occurred.", "ai-msg");
            return;
        }

        addMessage(data.reply, "ai-msg");

        /* ================= XP UPDATE ================= */

        if (data.xpEarned) {
            animateXP(data.xpEarned);
        }

        /* ================= LEVEL UPDATE ================= */

        if (data.level) {
            updateLevelUI(data.level);
        }

        if (data.rank) {
            updateRankUI(data.rank);
        }

        /* ================= ACHIEVEMENTS ================= */

        if (data.achievementsUnlocked && data.achievementsUnlocked.length > 0) {
            data.achievementsUnlocked.forEach(a => showAchievementPopup(a));
        }

    } catch (err) {
        console.error("AI ERROR:", err);
        addMessage("Server error. Please try again.", "ai-msg");
    }
}

/* =====================================================
   ADD MESSAGE UI
===================================================== */

function addMessage(text, type) {

    const chatBox = document.getElementById("chatBox");
    if (!chatBox) return;

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", type);
    msgDiv.innerText = text;

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

/* =====================================================
   XP ANIMATION
===================================================== */

function animateXP(earnedXP) {

    const xpElement = document.getElementById("userXP");
    if (!xpElement) return;

    let currentXP = parseInt(xpElement.innerText) || 0;
    let targetXP = currentXP + earnedXP;
    let increment = 0;

    const interval = setInterval(() => {
        increment++;
        xpElement.innerText = currentXP + increment;

        if (increment >= earnedXP) {
            clearInterval(interval);
        }
    }, 40);
}

/* =====================================================
   UPDATE LEVEL UI
===================================================== */

function updateLevelUI(level) {
    const levelElement = document.getElementById("userLevel");
    if (levelElement) levelElement.innerText = level;
}

/* =====================================================
   UPDATE RANK UI
===================================================== */

function updateRankUI(rank) {
    const rankElement = document.getElementById("userRank");
    if (rankElement) rankElement.innerText = rank;
}

/* =====================================================
   ACHIEVEMENT POPUP
===================================================== */

function showAchievementPopup(title) {

    const popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.innerHTML = `
        🏆 Achievement Unlocked! <br>
        <strong>${title}</strong>
    `;

    document.body.appendChild(popup);

    setTimeout(() => popup.classList.add("show"), 100);

    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.remove(), 500);
    }, 4000);
}

/* =====================================================
   OCR FEATURE
===================================================== */

async function extractText() {

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];
    const token = localStorage.getItem("token");

    if (!file) return alert("Please upload an image first");
    if (!token) return alert("Please login first");

    const formData = new FormData();
    formData.append("image", file);

    try {

        const response = await fetch(`${API_BASE}/api/ai/ocr`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById("ocrPreview").style.display = "block";
            document.getElementById("ocrText").innerText = data.text;
        }

    } catch (err) {
        console.error(err);
        alert("OCR failed.");
    }
}
