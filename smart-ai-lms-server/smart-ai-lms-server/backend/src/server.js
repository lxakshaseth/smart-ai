require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const app = express();

/* =====================================================
   DATABASE CONNECT
===================================================== */

const connectDB = require("./config/db");
connectDB();

/* =====================================================
   IMPORT ROUTES
===================================================== */

const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");
const lectureRoutes = require("./routes/lecture.routes");
const youtubeRoutes = require("./routes/youtube.routes");
const booksRoutes = require("./routes/books.routes");
const progressRoutes = require("./routes/progress.routes");
const plannerRoutes = require("./routes/planner.routes");
const mockRoutes = require("./routes/mock.routes");
const goalRoutes = require("./routes/goal.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const brainRoutes = require("./routes/brain.routes");
const profileRoutes = require("./routes/profile.routes");

const { apiLimiter } = require("./middleware/rateLimit.middleware");

/* =====================================================
   SECURITY
===================================================== */

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   RATE LIMIT
===================================================== */

app.use("/api", apiLimiter);

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Smart AI LMS API Running",
    time: new Date().toISOString()
  });
});

/* =====================================================
   API ROUTES
===================================================== */

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/mock", mockRoutes);
app.use("/api/goal", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/brain", brainRoutes);
app.use("/api/profile", profileRoutes);

/* =====================================================
   FRONTEND PATH (CORRECT FOR YOUR STRUCTURE)
===================================================== */

const FRONTEND_PATH = path.resolve(
  __dirname,
  "../../../../smart-ai-lms-frontend"
);

if (!fs.existsSync(FRONTEND_PATH)) {
  console.error("❌ Frontend folder not found at:", FRONTEND_PATH);
  process.exit(1);
}

console.log("📁 Serving Frontend From:", FRONTEND_PATH);

/* =====================================================
   STATIC FILES
===================================================== */

app.use(express.static(FRONTEND_PATH));

/* =====================================================
   FRONTEND ROUTES
===================================================== */

const sendPage = (file) =>
  path.join(FRONTEND_PATH, file);

app.get("/", (req, res) =>
  res.sendFile(sendPage("login.html"))
);

app.get("/login", (req, res) =>
  res.sendFile(sendPage("login.html"))
);

app.get("/signup", (req, res) =>
  res.sendFile(sendPage("signup.html"))
);

app.get("/dashboard", (req, res) =>
  res.sendFile(sendPage("dashboard.html"))
);

app.get("/planner", (req, res) =>
  res.sendFile(sendPage("planner.html"))
);

app.get("/progress", (req, res) =>
  res.sendFile(sendPage("progress.html"))
);

app.get("/critical", (req, res) =>
  res.sendFile(sendPage("critical.html"))
);

app.get("/profile", (req, res) =>
  res.sendFile(sendPage("profile.html"))
);

app.get("/settings", (req, res) =>
  res.sendFile(sendPage("settings.html"))
);

/* =====================================================
   API 404
===================================================== */

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.originalUrl}`
  });
});

/* =====================================================
   FRONTEND FALLBACK
===================================================== */

app.use((req, res) => {
  if (!req.originalUrl.startsWith("/api")) {
    return res.sendFile(sendPage("login.html"));
  }

  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* =====================================================
   SERVER START
===================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on PORT ${PORT}`);
  console.log(`🌍 http://localhost:${PORT}`);
  console.log("=================================");
});
