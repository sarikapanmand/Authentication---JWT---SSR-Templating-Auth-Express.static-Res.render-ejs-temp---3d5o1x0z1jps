const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Your code goes here
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("user", userSchema);

module.exports = User;
