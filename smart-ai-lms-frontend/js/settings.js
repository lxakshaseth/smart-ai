const token = localStorage.getItem("token");
if (!token) window.location.href = "/login";

const darkToggle = document.getElementById("darkToggle");

if (localStorage.getItem("darkMode") === "true") {
    darkToggle.checked = true;
    document.body.classList.add("dark-mode");
}

darkToggle.addEventListener("change", () => {
    if (darkToggle.checked) {
        localStorage.setItem("darkMode", "true");
        document.body.classList.add("dark-mode");
    } else {
        localStorage.setItem("darkMode", "false");
        document.body.classList.remove("dark-mode");
    }
});

document.getElementById("logoutBtn")
.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/login";
});
