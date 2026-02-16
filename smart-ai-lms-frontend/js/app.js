let isLogin = true;
let currentChatId = null;
let token = localStorage.getItem("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OGJkZGQ3NzY4NDA0NjQ0MGU5NmZkNCIsImlhdCI6MTc3MDc3NTEyMSwiZXhwIjoxNzcxMzc5OTIxfQ.Cbg_eJ3s1fnSfSk8sgpvbvxJAzfQK-mU9OhtzV_Im1A");

// Auto login if token exists
window.onload = function () {
  if (token) {
    showChat();
  }
};

// ================= AUTH =================

function toggleAuth() {
  isLogin = !isLogin;

  document.getElementById("authTitle").innerText =
    isLogin ? "Login" : "Signup";

  document.getElementById("username").style.display =
    isLogin ? "none" : "block";
}

async function handleAuth() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  const url = isLogin
    ? "http://localhost:5000/api/auth/login"
    : "http://localhost:5000/api/auth/register";

  const body = isLogin
    ? { email, password }
    : { username, email, password };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  token = data.token;
  localStorage.setItem("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OGJkZGQ3NzY4NDA0NjQ0MGU5NmZkNCIsImlhdCI6MTc3MDc3NTEyMSwiZXhwIjoxNzcxMzc5OTIxfQ.Cbg_eJ3s1fnSfSk8sgpvbvxJAzfQK-mU9OhtzV_Im1A", token);
  showChat();
}

function showChat() {
  document.getElementById("authBox").style.display = "none";
  document.getElementById("chatScreen").style.display = "block";
  document.getElementById("sidebar").style.display = "block";
}

// ================= CHAT =================

async function createChat() {
  const res = await fetch(
    "http://localhost:5000/api/ai/new-chat",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
      },
    }
  );

  const data = await res.json();
  currentChatId = data._id;

  loadSessions();
}

async function loadSessions() {
  const res = await fetch(
    "http://localhost:5000/api/ai/sessions",
    {
      headers: {
        "Authorization": "Bearer " + token,
      },
    }
  );

  const chats = await res.json();

  const chatList = document.getElementById("chatList");
  chatList.innerHTML = "";

  chats.forEach(chat => {
    const div = document.createElement("div");
    div.innerText = chat.title || "New Chat";
    div.onclick = () => {
      currentChatId = chat._id;
      loadChat(chat._id);
    };
    chatList.appendChild(div);
  });
}

async function loadChat(chatId) {
  const res = await fetch(
    `http://localhost:5000/api/ai/chat/${chatId}`,
    {
      headers: {
        "Authorization": "Bearer " + token,
      },
    }
  );

  const chat = await res.json();
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  chat.messages.forEach(msg => {
    const p = document.createElement("p");
    p.innerHTML = `<b>${msg.role}:</b> ${msg.content}`;
    messagesDiv.appendChild(p);
  });
}

async function sendMessage() {
  const question = document.getElementById("question").value;

  if (!currentChatId) {
    alert("Create chat first!");
    return;
  }

  const res = await fetch(
    "http://localhost:5000/api/ai/ask",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({
        question,
        chatId: currentChatId,
      }),
    }
  );

  const data = await res.json();
  loadChat(currentChatId);
  document.getElementById("question").value = "";
}

// ================= STUDY =================

async function study(type) {
  const topic = prompt("Enter topic:");
  if (!topic) return;

  const res = await fetch(
    "http://localhost:5000/api/ai/study",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({ type, topic }),
    }
  );

  const data = await res.json();

  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML += `<p><b>${type}:</b> ${data.result}</p>`;
}

// ================= LOGOUT =================

function logout() {
  localStorage.removeItem("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OGJkZGQ3NzY4NDA0NjQ0MGU5NmZkNCIsImlhdCI6MTc3MDc3NTEyMSwiZXhwIjoxNzcxMzc5OTIxfQ.Cbg_eJ3s1fnSfSk8sgpvbvxJAzfQK-mU9OhtzV_Im1A");
  location.reload();
}

// ================= DARK MODE =================

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// ================= PASSWORD TOGGLE =================

function togglePassword() {
  const pass = document.getElementById("password");
  pass.type = pass.type === "password" ? "text" : "password";
}
