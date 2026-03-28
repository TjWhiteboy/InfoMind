const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  saveArticle,
  getSavedArticles,
  checkSaved,
  removeArticle
} = require("../controllers/articleController");

// GET  /api/articles          → all saved articles for user
// GET  /api/articles/check    → check if a specific article is saved
// POST /api/articles/save     → save an article
// DELETE /api/articles/:id    → remove a saved article

router.get("/",          auth, getSavedArticles);
router.get("/check",     auth, checkSaved);
router.post("/save",     auth, saveArticle);
router.delete("/:id",    auth, removeArticle);

// Legacy compat: GET /saved still works
router.get("/saved",     auth, getSavedArticles);

module.exports = router;
