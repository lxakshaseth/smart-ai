const API_BASE = "http://localhost:5000";

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Enter credentials");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("token", data.token);
            window.location.href = "index.html";
        } else {
            alert(data.message || "Login failed");
        }

    } catch (err) {
        alert("Server error");
    }
}
