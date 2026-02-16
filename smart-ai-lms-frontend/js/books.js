const API_BASE = "http://localhost:5000";

async function searchBooks() {

    const topic = document.getElementById("bookSearch").value.trim();
    const token = localStorage.getItem("token");

    if (!topic) return alert("Enter topic");
    if (!token) return alert("Login required");

    const res = await fetch(`${API_BASE}/api/books/suggest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ topic })
    });

    const data = await res.json();

    if (data.success) {
        renderBooks(data.books, data.level);
    }
}

function renderBooks(books, level) {

    const container = document.getElementById("bookResults");
    container.innerHTML = `<h3>Detected Level: ${level}</h3>`;

    books.forEach(book => {
        container.innerHTML += `
            <div class="book-card">
                <h4>${book.title}</h4>
                <a href="${book.link}" target="_blank">Open</a>
                <button onclick="bookmark('${book.title}','${book.link}')">
                    ⭐ Bookmark
                </button>
            </div>
        `;
    });
}

async function bookmark(title, link) {

    const token = localStorage.getItem("token");

    await fetch(`${API_BASE}/api/books/bookmark`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ title, link })
    });

    alert("Bookmarked!");
}
