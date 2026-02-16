// ======================================
// CONFIG
// ======================================
const API_BASE = "http://localhost:5000"; // 👈 backend port
const token = localStorage.getItem("token");

// ======================================
// AUTH CHECK
// ======================================
if (!token) {
    window.location.href = "/login";
}

// ======================================
// SAFE TEXT SETTER
// ======================================
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

// ======================================
// LOAD PROFILE DATA
// ======================================
async function loadProfile() {
    try {
        const res = await fetch(`${API_BASE}/api/profile`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        if (!res.ok) {
            throw new Error("Server responded with " + res.status);
        }

        const response = await res.json();

        if (!response.success) {
            throw new Error(response.message || "Failed to load");
        }

        const data = response.data;

        // ==========================
        // BASIC INFO
        // ==========================
        setText("userName", data.name || "User");
        setText("userEmail", data.email || "-");

        // ==========================
        // KPIs
        // ==========================
        setText("xp", data.xp ?? 0);
        setText("level", data.level ?? 1);
        setText("accuracy", (data.accuracy ?? 0) + "%");
        setText("streak", (data.streak ?? 0) + " Days");
        setText("readiness", (data.readiness ?? 0) + "%");
        setText("risk", data.risk || "Low");

        setText("weak", data.weakSubject || "Not Available");
        setText("strong", data.strongSubject || "Not Available");
        setText("trend", data.trend || "Stable");

        // ==========================
        // LEVEL PROGRESS
        // ==========================
        const progress = data.levelProgress ?? 0;
        const remainingXP = 100 - progress;

        const levelBar = document.getElementById("levelBar");
        if (levelBar) levelBar.style.width = progress + "%";

        setText("levelProgressText", remainingXP + " XP to next level");

        // ==========================
        // RISK COLOR
        // ==========================
        const riskCard = document.getElementById("riskCard");
        if (riskCard) {
            riskCard.style.transition = "0.3s ease";

            if (data.risk === "High") {
                riskCard.style.background = "#7f1d1d";
            } else if (data.risk === "Medium") {
                riskCard.style.background = "#78350f";
            } else {
                riskCard.style.background = "#14532d";
            }
        }

        // ==========================
        // DARK MODE SYNC
        // ==========================
        if (data.darkMode) {
            document.body.classList.add("dark-mode");
        }

        // ==========================
        // CHART
        // ==========================
        renderChart(data.weeklyXP || []);

    } catch (err) {
        console.error("PROFILE LOAD ERROR:", err.message);

        if (err.message.includes("401")) {
            localStorage.clear();
            window.location.href = "/login";
        } else {
            alert("Failed to load profile.");
        }
    }
}

// ======================================
// RENDER CHART
// ======================================
let xpChartInstance;

function renderChart(values) {
    const canvas = document.getElementById("xpChart");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");

    if (xpChartInstance) {
        xpChartInstance.destroy();
    }

    xpChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Weekly XP",
                data: values,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.2)",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ======================================
// EDIT PROFILE
// ======================================
const editBtn = document.getElementById("editProfileBtn");

if (editBtn) {
    editBtn.addEventListener("click", async () => {
        const newUsername = prompt("Enter new username:");
        if (!newUsername) return;

        try {
            const res = await fetch(`${API_BASE}/api/profile/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({ username: newUsername })
            });

            const response = await res.json();

            if (response.success) {
                setText("userName", response.username || newUsername);
                alert("Profile updated successfully!");
            } else {
                alert(response.message);
            }

        } catch {
            alert("Update failed");
        }
    });
}

// ======================================
// CHANGE PASSWORD
// ======================================
const changePassBtn = document.getElementById("changePasswordBtn");

if (changePassBtn) {
    changePassBtn.addEventListener("click", async () => {

        const currentPassword = prompt("Enter current password:");
        const newPassword = prompt("Enter new password:");

        if (!currentPassword || !newPassword) return;

        try {
            const res = await fetch(`${API_BASE}/api/profile/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const response = await res.json();
            alert(response.message);

        } catch {
            alert("Password update failed");
        }
    });
}

// ======================================
// DELETE ACCOUNT
// ======================================
const deleteBtn = document.getElementById("deleteAccountBtn");

if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {

        if (!confirm("⚠ This will permanently delete your account. Continue?"))
            return;

        try {
            const res = await fetch(`${API_BASE}/api/profile/delete-account`, {
                method: "DELETE",
                headers: {
                    Authorization: "Bearer " + token
                }
            });

            const response = await res.json();

            if (response.success) {
                localStorage.clear();
                window.location.href = "/login";
            } else {
                alert(response.message);
            }

        } catch {
            alert("Delete failed");
        }
    });
}

// ======================================
// LOGOUT
// ======================================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            window.location.href = "/login";
        }
    });
}

// ======================================
// INIT
// ======================================
loadProfile();
