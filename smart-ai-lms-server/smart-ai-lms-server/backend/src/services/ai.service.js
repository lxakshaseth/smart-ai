require("dotenv").config();
const OpenAI = require("openai");

// =====================================================
// 🔐 ENV VALIDATION
// =====================================================
if (!process.env.GROQ_API_KEY) {
  throw new Error("❌ GROQ_API_KEY is missing in .env file");
}

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

// =====================================================
// LOAD GROQ CLIENT SECURELY
// =====================================================
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// =====================================================
// UTILITY: CLEAN MARKDOWN (For JSON safety)
// =====================================================
function cleanAIResponse(text) {
  if (!text) return "";

  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

// =====================================================
// UTILITY: SAFE JSON PARSE
// =====================================================
function safeJSONParse(text) {
  try {
    const cleaned = cleanAIResponse(text);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON Parse Error:", error.message);
    return null;
  }
}

// =====================================================
// CORE GENERIC AI RESPONSE
// =====================================================
async function generateAIResponse(prompt, options = {}) {
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an intelligent academic AI system. Return clean JSON when requested. Never include markdown unless asked."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: options.temperature ?? 0.6,
      max_tokens: options.maxTokens ?? 1500
    });

    return response.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq AI Error:", error.response?.data || error.message);
    throw new Error("AI service failed");
  }
}

// =====================================================
// STRUCTURED JSON RESPONSE (Auto Parse)
// =====================================================
async function generateStructuredResponse(prompt) {
  const raw = await generateAIResponse(prompt);
  const parsed = safeJSONParse(raw);

  if (!parsed) {
    throw new Error("Invalid JSON received from AI");
  }

  return parsed;
}

// =====================================================
// SOLVE QUESTION (Tutor Mode)
// =====================================================
async function solveQuestion(question) {
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional academic tutor. Provide clear step-by-step explanation."
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    return response.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq Solve Error:", error.response?.data || error.message);
    throw new Error("AI solve failed");
  }
}

// =====================================================
// WEEKLY REVIEW GENERATOR (Planner Integration)
// =====================================================
async function generateWeeklyReview(data) {
  const prompt = `
You are an AI academic performance analyst.

Student Data:
Average Accuracy: ${data.accuracy}%
Risk Score: ${data.riskScore}/100
Completion: ${data.completion}%
Trend: ${data.trend}
Weak Subject: ${data.weakSubject}

Generate JSON only:
{
  "summary": "",
  "strengths": "",
  "weaknesses": "",
  "nextStrategy": "",
  "motivation": ""
}

No markdown. Only valid JSON.
`;

  return await generateStructuredResponse(prompt);
}

// =====================================================
// ADAPTIVE STUDY PLAN GENERATOR
// =====================================================
async function generateAdaptivePlanner(data) {
  const prompt = `
You are an AI adaptive study planner.

Student Stats:
Accuracy: ${data.accuracy}%
Risk Score: ${data.riskScore}/100
Risk Level: ${data.riskLevel}
Trend: ${data.trend}
Weak Subject: ${data.weakSubject}
Streak: ${data.streak}
Exam in: ${data.daysLeft} days

Rules:
- High risk → Increase practice weight
- Declining trend → Add revision blocks
- Improving trend → Increase difficulty
- Weak subject → Daily focus

Return JSON:
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "tasks": [
        { "type": "Core", "topic": "...", "weight": 3 },
        { "type": "Weak Practice", "topic": "...", "weight": 5 }
      ]
    }
  ]
}

Only valid JSON. No markdown.
`;

  return await generateStructuredResponse(prompt);
}

// =====================================================
// EXPORTS (UNCHANGED)
// =====================================================
module.exports = {
  generateAIResponse,
  generateStructuredResponse,
  generateWeeklyReview,
  generateAdaptivePlanner,
  solveQuestion,
  rebalancePlannerByMastery,
  calculateConfidence,
  predictNextScore,
  calculateExamReadiness
};
