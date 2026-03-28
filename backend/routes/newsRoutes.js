const express = require("express");
const router = express.Router();
const { getNews } = require("../controllers/newsController");

// @route   GET /news
// @desc    Get top headlines with optional filtering
// @access  Public
router.get("/news", getNews);

module.exports = router;
