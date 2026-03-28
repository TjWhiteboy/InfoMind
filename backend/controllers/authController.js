const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, profession } = req.body;

    if (!profession) return res.status(400).json({ success: false, message: "Profession is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Account already exists with this email"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      profession
    });

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully", 
      user: { id: user._id, profession: user.profession } 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 CHECK EMAIL
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    // Exact match case-insensitive
    const count = await User.countDocuments({ email: new RegExp(`^${email}$`, 'i') });
    res.json({ exists: count > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Check email failed" });
  }
};

// 🔹 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, profession: user.profession },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      token, 
      user: {
        fullName: user.name,
        email: user.email,
        id: user._id,
        profession: user.profession,
        profilePic: user.profilePic || ""
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

// ── GET PROFILE ──────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Fetch profile failed" });
  }
};

// ── UPDATE PROFILE ───────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select("-password");
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ error: "Update profile failed" });
  }
};

// ── UPDATE PASSWORD ──────────────────────────────────────────────
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Current password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Update password failed" });
  }
};

// ── UPDATE PHOTO ─────────────────────────────────────────────────
exports.updatePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = `/uploads/profile/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: imageUrl },
      { new: true }
    ).select("-password");

    res.json({ 
      success: true, 
      message: "Photo updated", 
      imageUrl,
      user 
    });
  } catch (err) {
    console.error("Update photo failed:", err.message);
    res.status(500).json({ error: "Update photo failed" });
  }
};

// ── DELETE ACCOUNT ───────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmationText } = req.body;
    
    if (!confirmationText || confirmationText.trim().toLowerCase() !== 'delete') {
      return res.status(400).json({ success: false, error: "Invalid confirmation text. Type 'delete' to confirm." });
    }
    
    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Delete saved articles
    const SavedArticle = require("../models/SavedArticle");
    await SavedArticle.deleteMany({ userId });

    // Delete chat history
    const Chat = require("../models/Chat");
    if (Chat) await Chat.deleteMany({ userId });

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ success: false, error: "Delete account failed" });
  }
};
