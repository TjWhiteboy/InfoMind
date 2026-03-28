const express = require("express");
const router = express.Router();

const { 
  summarize, 
  impact,
  chat, 
  sentiment,
  watchnext,
  navigator, 
  translate,
  saveChatHistory,
  getChatHistory
} = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/summary", authMiddleware, summarize);
router.post("/impact", authMiddleware, impact);
router.post("/chat", authMiddleware, chat);
router.post("/sentiment", authMiddleware, sentiment);
router.post("/watchnext", authMiddleware, watchnext);
router.post("/navigator", authMiddleware, navigator);
router.post("/translate", authMiddleware, translate);

// Chat History persistence
router.post("/chat/save", authMiddleware, saveChatHistory);
router.get("/chat/history/:articleId", authMiddleware, getChatHistory);

module.exports = router;
