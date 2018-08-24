const mongoose = require("mongoose");

const Todo = mongoose.model("Todo", {
  text: {
    type: String,
    required: true,
    minLength: 1
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number
  }
});

module.exports = Todo;
