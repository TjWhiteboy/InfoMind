const SavedArticle = require("../models/SavedArticle");

// ── SAVE ARTICLE ──────────────────────────────────────────────────
// POST /api/articles/save
// Body: { article: { title, description, content, imageUrl, url, source, publishedAt, category } }
exports.saveArticle = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const article = req.body.article || req.body;

    if (!article.title) {
      return res.json({ success: false, message: "Article title required" });
    }

    // Duplicate guard: same URL for same user
    const existing = await SavedArticle.findOne({ userId, url: article.url || "" });
    if (existing) {
      return res.json({ success: true, alreadySaved: true, article: existing });
    }

    const saved = await SavedArticle.create({
      userId,
      title:       article.title       || "Untitled",
      description: article.description || "",
      content:     article.content     || "",
      imageUrl:    article.imageUrl    || article.image || "",
      url:         article.url         || "",
      source:      article.source      || "Unknown",
      publishedAt: article.publishedAt || new Date().toLocaleDateString(),
      category:    article.category    || "business"
    });

    res.json({ success: true, article: saved });
  } catch (err) {
    console.error("saveArticle error:", err.message);
    // Handle mongo duplicate key gracefully
    if (err.code === 11000) {
      return res.json({ success: true, alreadySaved: true });
    }
    res.status(500).json({ success: false, error: "Save failed" });
  }
};

// ── GET SAVED ARTICLES ────────────────────────────────────────────
// GET /api/articles
exports.getSavedArticles = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const articles = await SavedArticle.find({ userId }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error("getSavedArticles error:", err.message);
    res.json([]);
  }
};

// ── CHECK IF SAVED ────────────────────────────────────────────────
// GET /api/articles/check?url=...
exports.checkSaved = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { url } = req.query;
    const exists = await SavedArticle.findOne({ userId, url: url || "" });
    res.json({ isSaved: !!exists, id: exists?._id || null });
  } catch (err) {
    res.json({ isSaved: false, id: null });
  }
};

// ── REMOVE SAVED ARTICLE ──────────────────────────────────────────
// DELETE /api/articles/:id
exports.removeArticle = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    // Allow delete by MongoDB _id OR by URL (passed as query)
    let deleted;
    if (id && id !== "by-url") {
      deleted = await SavedArticle.findOneAndDelete({ _id: id, userId });
    } else {
      const { url } = req.query;
      deleted = await SavedArticle.findOneAndDelete({ userId, url });
    }

    if (!deleted) {
      return res.json({ success: false, message: "Article not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("removeArticle error:", err.message);
    res.status(500).json({ success: false, error: "Remove failed" });
  }
};
