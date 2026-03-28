const mongoose = require("mongoose");

// Role/content format for OpenAI-compatible history
const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], default: "user" },
  content: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: String, default: "anonymous" },
  article: { type: String, required: true }, // articleId or URL
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", chatSchema);
