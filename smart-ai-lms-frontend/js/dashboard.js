// ======================================================
// 🧠 SMART AI LMS – DASHBOARD SCRIPT (FINAL PRO VERSION)
// ======================================================

// 🔥 Auto detect backend (same origin)
const API_BASE = "";
const token = localStorage.getItem("token");

// ======================================================
// 🔐 AUTH CHECK
// ======================================================

if (!token) {
    window.location.href = "/login";
}

// ======================================================
// 🌓 DARK MODE SYSTEM
// ======================================================

function applySavedTheme() {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
        document.body.classList.add("dark-mode");
    }
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
}

// ======================================================
// 🚀 INIT
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    applySavedTheme();
    loadBrainSummary();
    setupWhiteboard();
});

// ======================================================
// 🧠 LOAD DASHBOARD SUMMARY
// ======================================================

async function loadBrainSummary() {

    try {

        const res = await fetch(`/api/brain/summary`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            localStorage.clear();
            return window.location.href = "/login";
        }

        const data = await res.json();

        if (!data.success) return;

        const summary = data.summary || {};

        setText("xpValue", summary.xp ?? 0);
        setText("levelValue", summary.level ?? 1);
        setText("accuracyValue", (summary.accuracy ?? 0) + "%");
        setText("streakValue", summary.currentStreak ?? 0);

    } catch (err) {
        console.error("Dashboard Load Error:", err);
    }
}

// ======================================================
// 🧾 SAFE TEXT SETTER
// ======================================================

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

// ======================================================
// 🚪 LOGOUT
// ======================================================

function logout() {
    localStorage.clear();
    window.location.href = "/login";
}

// ======================================================
// 🖌 WHITEBOARD SYSTEM
// ======================================================

let canvas, ctx;
let drawing = false;

function setupWhiteboard() {

    canvas = document.getElementById("whiteboard");
    if (!canvas) return;

    ctx = canvas.getContext("2d");

    // Retina scaling fix
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    // Mouse
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);
    canvas.addEventListener("mousemove", draw);

    // Touch
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", stopDraw);
}

function startDraw(e) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function stopDraw() {
    drawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!drawing) return;

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

// Touch helpers
function handleTouchStart(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    startDraw({
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
    });
}

function handleTouchMove(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    draw({
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
    });
}

// ======================================================
// 🧹 CLEAR WHITEBOARD
// ======================================================

function clearBoard() {
    if (!canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setText("resultBox", "");
}

// ======================================================
// 🔍 OCR + SAFE MATH SOLVER
// ======================================================

async function solveDrawing() {

    if (!canvas) return;

    setText("resultBox", "Processing drawing...");

    try {

        const imageData = canvas.toDataURL("image/png");
        const blob = await (await fetch(imageData)).blob();

        const formData = new FormData();
        formData.append("image", blob, "drawing.png");

        const res = await fetch(`/api/ai/ocr`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            },
            body: formData
        });

        if (res.status === 401) {
            localStorage.clear();
            return window.location.href = "/login";
        }

        const data = await res.json();

        if (!data.success) {
            setText("resultBox", "OCR Failed");
            return;
        }

        const extracted = data.text || "No text detected";
        let answer = "";

        try {
            const cleaned = extracted.replace(/\s/g, "");

            // Strict safe math validation
            if (/^[0-9+\-*/().=]+$/.test(cleaned)) {

                const expression = cleaned.replace("=", "");

                // Safe eval alternative
                const result = Function('"use strict"; return (' + expression + ')')();

                answer = `\n\nSolved Answer: ${result}`;
            }

        } catch (err) {
            console.warn("Math solve skipped:", err.message);
        }

        setText("resultBox", "Extracted:\n" + extracted + answer);

    } catch (err) {
        console.error("OCR Error:", err);
        setText("resultBox", "Server Error");
    }
}
