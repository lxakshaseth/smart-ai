const API_BASE = "http://localhost:5000";

// =======================
// GENERATE NOTES
// =======================

async function generateNotes() {
    const topic = document.getElementById("topicInput").value.trim();
    const token = localStorage.getItem("token");
    const output = document.getElementById("output");

    if (!topic) return alert("Enter topic first");
    if (!token) return alert("Please login first");

    output.innerHTML = "⏳ Generating notes...";
    disableButtons(true);

    try {
        const response = await fetch(`${API_BASE}/api/ai/study`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ topic })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Server Error:", text);
            output.innerHTML = "❌ Backend error: " + response.status;
            disableButtons(false);
            return;
        }

        const data = await response.json();

        if (data.success) {
            output.innerText = data.notes;
        } else {
            output.innerHTML = "❌ " + (data.message || "Study generation failed");
        }

    } catch (err) {
        console.error("Fetch Error:", err);
        output.innerHTML = "❌ Server not reachable or crashed.";
    }

    disableButtons(false);
}

// =======================
// GENERATE QUIZ
// =======================

async function generateQuiz() {
    const topic = document.getElementById("topicInput").value.trim();
    const token = localStorage.getItem("token");
    const output = document.getElementById("output");

    if (!topic) return alert("Enter topic first");
    if (!token) return alert("Please login first");

    output.innerHTML = "⏳ Generating quiz...";
    disableButtons(true);

    try {
        const response = await fetch(`${API_BASE}/api/ai/generate-quiz`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ topic })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Server Error:", text);
            output.innerHTML = "❌ Backend error: " + response.status;
            disableButtons(false);
            return;
        }

        const data = await response.json();

        if (data.success) {
            output.innerText = data.quiz;
        } else {
            output.innerHTML = "❌ Quiz generation failed";
        }

    } catch (err) {
        console.error("Fetch Error:", err);
        output.innerHTML = "❌ Server not reachable or crashed.";
    }

    disableButtons(false);
}

// =======================
// DISABLE BUTTONS (UX IMPROVEMENT)
// =======================

function disableButtons(state) {
    const buttons = document.querySelectorAll("button");
    buttons.forEach(btn => btn.disabled = state);
}

// =======================
// CLEAR OUTPUT
// =======================

function clearOutput() {
    document.getElementById("output").innerHTML = "";
}

// =======================
// EXPORT PDF
// =======================

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const content = document.getElementById("output").innerText;

    if (!content) {
        alert("Nothing to export");
        return;
    }

    doc.text(content, 10, 10);
    doc.save("study-notes.pdf");
}
