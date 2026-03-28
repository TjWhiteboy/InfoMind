const OpenAI = require("openai");
const Chat = require("../models/Chat");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// Helper: safely parse JSON from model output
function safeJsonParse(text, fallback) {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

// Helper: call OpenAI with timeout protection
async function callAI(messages, model = "google/gemini-2.0-flash-001") {
  const response = await openai.chat.completions.create({ model, messages });
  return response.choices[0].message.content.trim();
}

// ─── SUMMARIZE ───────────────────────────────────────────────────────────────
exports.summarize = async (req, res) => {
  try {
    const { content, lang } = req.body;
    if (!content) return res.json({ bullets: ["No content provided."] });

    const prompt = `Summarize this business news article into 4-5 bullet points in simple language.
Return ONLY a JSON array of strings. No preamble, no markdown.
Example: ["point 1", "point 2", "point 3"]
Article: ${content}`;

    const text = await callAI([{ role: "user", content: prompt }]);
    const bullets = safeJsonParse(text, [text]);
    res.json({ bullets: Array.isArray(bullets) ? bullets : [text] });
  } catch (err) {
    console.error("Summarize Error:", err.message);
    res.json({ bullets: ["Unable to generate summary at this time. Please try again."] });
  }
};

// ─── IMPACT ──────────────────────────────────────────────────────────────────
exports.impact = async (req, res) => {
  try {
    const { content, lang } = req.body;
    const profession = req.user?.profession || req.body.persona || "professional";
    
    if (!content) return res.json({ impact: "No content provided." });

    const prompt = `Explain why this business news matters in under 100 words. Tailor for a ${profession}.
Return ONLY plain text, no markdown.
investor = market + portfolio impact | founder = opportunities + disruption
student = simple language + definitions | professional = policy + corporate impact
Engineer = technology + innovation impact | Trader = markets + finance impact
Article: ${content}`;

    const text = await callAI([{ role: "user", content: prompt }]);
    res.json({ impact: text });
  } catch (err) {
    console.error("Impact Error:", err.message);
    res.json({ impact: "Impact analysis is temporarily unavailable. Please try again." });
  }
};

// ─── CHAT ─────────────────────────────────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { content, message, history = [] } = req.body;
    const profession = req.user?.profession || req.body.persona || "professional";
    
    if (!message) return res.json({ reply: "Please ask a question." });

    const messages = [
      {
        role: "system",
        content: `You are an AI news assistant. The user is a ${profession}. Answer based ONLY on this article: ${content || "No article provided."}`
      },
      // Normalize history: accept both {role,content} and legacy {question,answer}
      ...history.map(h => {
        if (h.role) return h;
        return [
          { role: "user", content: h.question || "" },
          { role: "assistant", content: h.answer || "" }
        ];
      }).flat().filter(m => m.content),
      { role: "user", content: message }
    ];

    const text = await callAI(messages);
    res.json({ reply: text });
  } catch (err) {
    console.error("Chat Error:", err.message);
    res.json({ reply: "I'm unable to respond right now. Please try again in a moment." });
  }
};

// ─── SENTIMENT ────────────────────────────────────────────────────────────────
exports.sentiment = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title && !description) return res.json({ sentiment: "neutral", score: 0.5 });

    const prompt = `Analyze sentiment of this news.
Return ONLY one word: positive, negative, or neutral.
Title: ${title || ""}
Description: ${description || ""}`;

    const text = await callAI([{ role: "user", content: prompt }]);
    const raw = text.toLowerCase().trim();
    const sentiment = ["positive", "negative", "neutral"].includes(raw) ? raw : "neutral";
    res.json({ sentiment, score: 0.8 });
  } catch (err) {
    console.error("Sentiment Error:", err.message);
    res.json({ sentiment: "neutral", score: 0.5 });
  }
};

// ─── WATCH NEXT ───────────────────────────────────────────────────────────────
exports.watchnext = async (req, res) => {
  try {
    const { content } = req.body;
    const fallback = [
      { id: "f1", title: "Market developments expected soon", description: "Global markets are bracing for a period of adjustment.", source: "Analyst Brief", url: "#" },
      { id: "f2", title: "Regulatory updates anticipated", description: "New policy frameworks are being drafted for review.", source: "Policy Monitor", url: "#" },
      { id: "f3", title: "Industry response pending", description: "Major players are preparing unified statements.", source: "Corporate Wire", url: "#" }
    ];

    if (!content) return res.json({ predictions: fallback });

    const prompt = `Based on this news article, predict 3 likely future developments or related follow-up stories.
Return ONLY a JSON array of 3 objects. No preamble, no markdown.
Each object must have:
- title (string, max 10 words)
- description (string, max 20 words)
- category (string, e.g. "MARKETS", "TECH")
- source (string, a realistic source name)
- content (string, 2 paragraphs of simulated future news content)
- imageUrl (string, use a generic Unsplash business image URL)

Article: ${content}`;

    const text = await callAI([{ role: "user", content: prompt }]);
    const predictions = safeJsonParse(text, []);
    
    if (Array.isArray(predictions) && predictions.length > 0) {
      // Ensure IDs for React keys
      const formatted = predictions.slice(0, 3).map((p, i) => ({
        ...p,
        id: `pred-${Date.now()}-${i}`,
        publishedAt: "Predictive Forecast"
      }));
      res.json({ predictions: formatted });
    } else {
      res.json({ predictions: fallback });
    }
  } catch (err) {
    console.error("WatchNext Error:", err.message);
    res.json({ predictions: fallback });
  }
};

// ─── NAVIGATOR ───────────────────────────────────────────────────────────────
exports.navigator = async (req, res) => {
  try {
    const { articles } = req.body;
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.json({
        summary: "No articles were selected for analysis.",
        insights: ["Please select at least 2 articles from the news feed to generate a briefing."],
        questions: ["What topics interest you most?", "Which industries are you tracking?", "What time horizon matters to you?"]
      });
    }

    const combined = articles.map((a, i) => `${i + 1}. ${a.title || "Untitled"}: ${a.content || a.description || "No content"}`).join("\n");
    const prompt = `Analyze the following news articles and return:
1. A 2-3 sentence combined summary
2. Exactly 5 key insights
3. Exactly 3 questions for further exploration

Articles:
${combined}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "summary": "...",
  "insights": ["...", "...", "...", "...", "..."],
  "questions": ["...", "...", "..."]
}`;

    const text = await callAI([{ role: "user", content: prompt }]);
    const parsed = safeJsonParse(text, null);

    if (parsed && parsed.summary) {
      res.json({
        summary: parsed.summary || "Analysis complete.",
        insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 5) : [],
        questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 3) : []
      });
    } else {
      // Plain text fallback
      res.json({
        summary: text.slice(0, 400),
        insights: ["Analysis generated — see summary above for details."],
        questions: ["What are the broader implications?", "How does this affect the market?", "What should investors watch next?"]
      });
    }
  } catch (err) {
    console.error("Navigator Error:", err.message);
    res.json({
      summary: "Navigator analysis is temporarily unavailable. Please try again.",
      insights: ["AI processing is temporarily unavailable.", "Please check your connection and retry."],
      questions: ["What topics would you like to explore?", "Which articles caught your attention?", "What trends are you tracking?"]
    });
  }
};

// ─── TRANSLATE ────────────────────────────────────────────────────────────────
exports.translate = async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text) return res.json({ translatedText: "" });

    const langMap = { ta: "Tamil", hi: "Hindi", te: "Telugu", ml: "Malayalam", en: "English" };
    const langName = langMap[targetLang] || targetLang || "Tamil";

    const prompt = `Translate the following text to ${langName}. 
Produce a natural, fluent translation — not word-by-word. Use proper grammar and idioms for the target language.
Return ONLY the translated text with no preamble or explanation.

Text: ${text}`;

    const translated = await callAI([{ role: "user", content: prompt }]);
    res.json({ translatedText: translated });
  } catch (err) {
    console.error("Translate Error:", err.message);
    res.json({ translatedText: text || "" }); // Fall back to original text, not an error
  }
};

// ─── CHAT HISTORY (MongoDB) ──────────────────────────────────────────────────
exports.saveChatHistory = async (req, res) => {
  try {
    const { userId = "anonymous", articleId, messages } = req.body;
    if (!articleId || !Array.isArray(messages)) {
      return res.json({ success: false, message: "articleId and messages array required" });
    }

    let chat = await Chat.findOne({ userId, article: articleId });
    if (chat) {
      chat.messages = messages;
      await chat.save();
    } else {
      chat = await Chat.create({ userId, article: articleId, messages });
    }
    res.json({ success: true, chat });
  } catch (err) {
    console.error("SaveChatHistory Error:", err.message);
    res.json({ success: false, message: "Could not save chat history" });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.query.userId || "anonymous";
    const chat = await Chat.findOne({ userId, article: articleId });
    res.json({ messages: chat?.messages || [] });
  } catch (err) {
    console.error("GetChatHistory Error:", err.message);
    res.json({ messages: [] });
  }
};
