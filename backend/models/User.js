const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  profession: { type: String, required: true },
  profilePic: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
