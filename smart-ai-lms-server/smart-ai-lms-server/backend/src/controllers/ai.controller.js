const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const OpenAI = require("openai");
const mongoose = require("mongoose");

/* ===============================
   GROQ CONFIG
=============================== */

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

/* ===============================
   SAFE GROQ CALL
=============================== */

async function safeGroqCall(config) {
  return await Promise.race([
    groq.chat.completions.create(config),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Groq Timeout")), 15000)
    )
  ]);
}

/* ===============================
   HELPERS
=============================== */

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function updateStreak(user) {
  const today = getToday();

  if (!user.lastActiveDate) {
    user.streak = 1;
  } else {
    const last = new Date(user.lastActiveDate);
    const diff = (new Date(today) - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) user.streak += 1;
    else if (diff > 1) user.streak = 1;
  }

  user.lastActiveDate = today;
}

function updateWeeklyActivity(user, type, xpEarned = 0) {
  const today = getToday();

  let activity = user.weeklyActivity.find(a => a.date === today);

  if (!activity) {
    activity = {
      date: today,
      questions: 0,
      notes: 0,
      quizzes: 0,
      xpEarned: 0
    };
    user.weeklyActivity.push(activity);
  }

  activity[type] += 1;
  activity.xpEarned += xpEarned;

  user.weeklyActivity = user.weeklyActivity.slice(-7);
}

function updateSubjectStats(user, topic, type) {
  const subject = topic.split(" ")[0];

  let stat = user.subjectStats.find(s => s.subject === subject);

  if (!stat) {
    stat = {
      subject,
      questions: 0,
      notes: 0,
      quizzes: 0,
      mastery: 0
    };
    user.subjectStats.push(stat);
  }

  stat[type] += 1;

  stat.mastery = Math.min(
    100,
    stat.questions * 5 + stat.notes * 7 + stat.quizzes * 10
  );
}

function unlockAchievements(user) {
  const unlocked = [];

  if (user.xp >= 100 && !user.achievements.includes("100_XP")) {
    user.achievements.push("100_XP");
    unlocked.push("100 XP Milestone");
  }

  if (user.streak >= 7 && !user.achievements.includes("7_DAY_STREAK")) {
    user.achievements.push("7_DAY_STREAK");
    unlocked.push("7 Day Streak");
  }

  if (user.totalQuestions >= 50 && !user.achievements.includes("50_QUESTIONS")) {
    user.achievements.push("50_QUESTIONS");
    unlocked.push("50 Questions Completed");
  }

  return unlocked;
}

/* ===============================
   CREATE NEW CHAT
=============================== */

const createNewChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      user: req.user.id,
      title: "New Chat",
      messages: []
    });

    res.json({
      success: true,
      chatId: chat._id
    });

  } catch (error) {
    console.error("CREATE CHAT ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ===============================
   GET ALL SESSIONS
=============================== */

const getSessions = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .select("_id title updatedAt")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      sessions: chats
    });

  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ===============================
   GET SINGLE CHAT
=============================== */

const getSingleChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!chat)
      return res.status(404).json({ success: false });

    res.json({
      success: true,
      chat
    });

  } catch (error) {
    console.error("GET CHAT ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ===============================
   ASK AI
=============================== */

const askAI = async (req, res) => {
  try {
    const { chatId, question } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chatId))
      return res.status(400).json({ success: false });

    const chat = await Chat.findById(chatId);
    if (!chat)
      return res.status(404).json({ success: false });

    chat.messages.push({ role: "user", content: question });

    const cleanMessages = chat.messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    const completion = await safeGroqCall({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a professional AI tutor." },
        ...cleanMessages
      ],
      max_tokens: 600
    });

    const reply = completion.choices[0].message.content;

    chat.messages.push({ role: "assistant", content: reply });
    await chat.save();

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false });

    const earnedXP = 5;

    user.totalQuestions += 1;
    user.xp += earnedXP;

    updateStreak(user);
    updateWeeklyActivity(user, "questions", earnedXP);
    updateSubjectStats(user, question, "questions");

    const unlocked = unlockAchievements(user);

    await user.save();

    res.json({
      success: true,
      reply,
      xpEarned: earnedXP,
      level: user.level,
      rank: user.rank,
      achievementsUnlocked: unlocked
    });

  } catch (error) {
    console.error("ASK AI ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ===============================
   STUDY MODE
=============================== */

const studyMode = async (req, res) => {
  try {
    const { topic } = req.body;

    const completion = await safeGroqCall({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Generate structured study notes." },
        { role: "user", content: topic }
      ],
      max_tokens: 600
    });

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false });

    const earnedXP = 10;

    user.totalNotes += 1;
    user.xp += earnedXP;

    updateStreak(user);
    updateWeeklyActivity(user, "notes", earnedXP);
    updateSubjectStats(user, topic, "notes");

    const unlocked = unlockAchievements(user);

    await user.save();

    res.json({
      success: true,
      notes: completion.choices[0].message.content,
      xpEarned: earnedXP,
      level: user.level,
      rank: user.rank,
      achievementsUnlocked: unlocked
    });

  } catch (error) {
    console.error("STUDY MODE ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ===============================
   QUIZ
=============================== */

const generateQuiz = async (req, res) => {
  try {
    const { topic } = req.body;

    const completion = await safeGroqCall({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Generate 5 MCQ questions." },
        { role: "user", content: topic }
      ],
      max_tokens: 500
    });

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false });

    const earnedXP = 15;

    user.totalQuizzes += 1;
    user.xp += earnedXP;

    updateStreak(user);
    updateWeeklyActivity(user, "quizzes", earnedXP);
    updateSubjectStats(user, topic, "quizzes");

    const unlocked = unlockAchievements(user);

    await user.save();

    res.json({
      success: true,
      quiz: completion.choices[0].message.content,
      xpEarned: earnedXP,
      level: user.level,
      rank: user.rank,
      achievementsUnlocked: unlocked
    });

  } catch (error) {
    console.error("QUIZ ERROR:", error);
    res.status(500).json({ success: false });
  }
};

/* ===============================
   OCR
=============================== */

const ocrFromImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false });

    const result = await Tesseract.recognize(req.file.path, "eng");
    fs.unlinkSync(req.file.path);

    res.json({ success: true, text: result.data.text });

  } catch (error) {
    console.error("OCR ERROR:", error);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  askAI,
  studyMode,
  generateQuiz,
  ocrFromImage,
  createNewChat,
  getSessions,
  getSingleChat
};
