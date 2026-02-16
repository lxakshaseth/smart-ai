const API_BASE = "http://localhost:5000";

// =======================================================
// 🚀 INIT
// =======================================================

document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");

    // 🔁 If already logged in → redirect
    if (token) {
        window.location.href = "/dashboard";
        return;
    }

    const form = document.getElementById("loginForm");
    const errorBox = document.getElementById("loginError");

    if (!form) {
        console.error("Login form not found");
        return;
    }

    form.addEventListener("submit", handleLogin);
});


// =======================================================
// 🔐 HANDLE LOGIN
// =======================================================

async function handleLogin(e) {

    e.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const errorBox = document.getElementById("loginError");
    const button = e.target.querySelector("button");

    if (errorBox) errorBox.innerText = "";

    if (!email || !password) {
        showError("Please fill all fields");
        return;
    }

    try {

        // 🔄 Loading state
        if (button) {
            button.disabled = true;
            button.innerText = "Logging in...";
        }

        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            showError(data.message || "Invalid email or password");
            resetButton(button);
            return;
        }

        // ✅ Save token
        localStorage.setItem("token", data.token);

        // ✅ Redirect
        window.location.href = "/dashboard";

    } catch (error) {
        console.error("Login Error:", error);
        showError("Server not reachable");
        resetButton(button);
    }
}


// =======================================================
// ❌ SHOW ERROR
// =======================================================

function showError(message) {
    const errorBox = document.getElementById("loginError");
    if (errorBox) {
        errorBox.innerText = message;
    } else {
        alert(message);
    }
}


// =======================================================
// 🔁 RESET BUTTON
// =======================================================

function resetButton(button) {
    if (!button) return;
    button.disabled = false;
    button.innerText = "Login";
}
