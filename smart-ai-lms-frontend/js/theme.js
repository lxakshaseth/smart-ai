// ======================================================
// 🌙 SMART AI LMS – GLOBAL THEME ENGINE
// ======================================================

(function () {

    const THEME_KEY = "smart_lms_theme";
    const DARK_CLASS = "dark-mode";

    // ============================================
    // APPLY THEME
    // ============================================

    function applyTheme(theme) {

        if (theme === "dark") {
            document.body.classList.add(DARK_CLASS);
        } else {
            document.body.classList.remove(DARK_CLASS);
        }

        localStorage.setItem(THEME_KEY, theme);
        updateToggleIcon(theme);
    }

    // ============================================
    // GET SAVED OR SYSTEM THEME
    // ============================================

    function getPreferredTheme() {

        const saved = localStorage.getItem(THEME_KEY);

        if (saved) return saved;

        // Detect system preference
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        return systemDark ? "dark" : "light";
    }

    // ============================================
    // TOGGLE THEME
    // ============================================

    function toggleTheme() {

        const current = document.body.classList.contains(DARK_CLASS)
            ? "dark"
            : "light";

        const newTheme = current === "dark" ? "light" : "dark";

        applyTheme(newTheme);
    }

    // ============================================
    // UPDATE BUTTON ICON
    // ============================================

    function updateToggleIcon(theme) {

        const toggleBtn = document.querySelector("[data-theme-toggle]");

        if (!toggleBtn) return;

        toggleBtn.innerText = theme === "dark" ? "☀️" : "🌙";
    }

    // ============================================
    // AUTO INIT
    // ============================================

    document.addEventListener("DOMContentLoaded", () => {

        const preferred = getPreferredTheme();
        applyTheme(preferred);

        const toggleBtn = document.querySelector("[data-theme-toggle]");

        if (toggleBtn) {
            toggleBtn.addEventListener("click", toggleTheme);
        }
    });

})();
