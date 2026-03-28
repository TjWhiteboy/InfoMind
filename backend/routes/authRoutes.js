const express = require("express");
const router = express.Router();

const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  updatePassword, 
  updatePhoto, 
  deleteAccount,
  checkEmail
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadConfig");

router.post("/register", register);
router.post("/login", login);
router.post("/check-email", checkEmail);

// Protected Profile Routes
router.get("/profile",      auth, getProfile);
router.put("/profile",      auth, updateProfile);
router.put("/password",     auth, updatePassword);
router.put("/photo",        auth, upload.single("photo"), updatePhoto);
router.delete("/profile",   auth, deleteAccount);

module.exports = router;
