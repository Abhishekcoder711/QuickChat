const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_online:{ type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);