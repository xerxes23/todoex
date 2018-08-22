const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/TodoApp")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Unable to connect MongoDB"));

const Todo = mongoose.model("Todo", {
  text: {
    type: String
  },
  completed: {
    type: Boolean
  },
  completedAt: {
    type: Number
  }
});

const newTodo = new Todo({
  text: "Learn Algorithmic Thinking"
});

newTodo
  .save()
  .then(todo => console.log("Saved todo", todo))
  .catch(err => console.log("Unable to save todo"));

const anotherTodo = new Todo({
  text: "Become a great software engineer",
  completed: false
});

anotherTodo
  .save()
  .then(todo => console.log("Saved todo", todo))
  .catch(err => console.log("Unable to save todo"));
