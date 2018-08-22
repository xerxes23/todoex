const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    type: String,
    minlength: 6,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  }
});

module.exports = User;
