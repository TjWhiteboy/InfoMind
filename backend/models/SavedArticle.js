const mongoose = require("mongoose");

const savedArticleSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title:       { type: String, default: "" },
  description: { type: String, default: "" },
  content:     { type: String, default: "" },
  imageUrl:    { type: String, default: "" },
  url:         { type: String, default: "" },   // used for duplicate check
  source:      { type: String, default: "Unknown" },
  publishedAt: { type: String, default: "" },
  category:    { type: String, default: "business" },
  createdAt:   { type: Date, default: Date.now }
});

// Compound index: one article per user (by URL)
savedArticleSchema.index({ userId: 1, url: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("SavedArticle", savedArticleSchema);
