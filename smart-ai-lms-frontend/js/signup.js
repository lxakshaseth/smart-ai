const API_BASE = "http://localhost:5000";

/* =====================================================
   SIGNUP FUNCTION
===================================================== */

async function signup(event) {

    if (event) event.preventDefault();

    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const errorBox = document.getElementById("errorMsg");
    const btn = document.getElementById("signupBtn");

    const username = usernameInput?.value.trim();
    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();

    if (errorBox) errorBox.innerText = "";

    /* ================= VALIDATION ================= */

    if (!username || !email || !password) {
        if (errorBox) errorBox.innerText = "All fields are required";
        return;
    }

    if (password.length < 6) {
        if (errorBox) errorBox.innerText = "Password must be at least 6 characters";
        return;
    }

    try {

        /* ================= BUTTON LOADING ================= */

        if (btn) {
            btn.disabled = true;
            btn.innerText = "Creating account...";
        }

        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        /* ================= HANDLE SERVER NOT FOUND ================= */

        if (response.status === 404) {
            throw new Error("API Route Not Found");
        }

        let data;

        try {
            data = await response.json();
        } catch (err) {
            throw new Error("Invalid server response");
        }

        /* ================= HANDLE ERROR STATUS ================= */

        if (!response.ok || !data.success) {

            if (errorBox) {
                errorBox.innerText =
                    data?.message || "Registration failed. Please try again.";
            }

            if (btn) {
                btn.disabled = false;
                btn.innerText = "Sign Up";
            }

            return;
        }

        /* ================= STORE TOKEN ================= */

        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        /* ================= SUCCESS ================= */

        if (errorBox) {
            errorBox.style.color = "#22c55e";
            errorBox.innerText = "Account created successfully!";
        }

        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 800);

    } catch (error) {

        console.error("Signup Error:", error);

        if (errorBox) {
            errorBox.style.color = "#ef4444";

            if (error.message === "API Route Not Found") {
                errorBox.innerText = "Backend route not found. Check server.";
            } else if (error.message === "Invalid server response") {
                errorBox.innerText = "Server returned invalid response.";
            } else {
                errorBox.innerText = "Server error. Please try again.";
            }
        }

        if (btn) {
            btn.disabled = false;
            btn.innerText = "Sign Up";
        }
    }
}


/* =====================================================
   AUTO ATTACH FORM SUBMIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("signupForm");

    if (form) {
        form.addEventListener("submit", signup);
    }

});
