const express = require("express");
const bodyParser = require("body-parser");

// DB
const { ObjectId } = require("mongodb");
const mongoose = require("./db/mongoose");
const Todo = require("./models/Todo");
const User = require("./models/User");

// Server

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root route
app.get("/", (req, res) => {
  res.send("Hello");
});

// POST /todos
app.post("/todos", (req, res) => {
  const newTodo = new Todo({
    text: req.body.text
  });
  newTodo
    .save()
    .then(todo => res.status(200).json({ success: true, todo }))
    .catch(err => res.status(400).json({ success: false, error: err }));
});

// GET /todos
app.get("/todos", (req, res) => {
  Todo.find({})
    .then(todos => res.status(200).json({ success: true, todos }))
    .catch(err => res.status(400).json({ success: false, error: err }));
});

// GET /todos/:id
app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Not a valid ID" });
  }
  Todo.findById()
    .then(todo => {
      if (!todo) {
        res.status(404).json({ error: "No todo found" });
      }
      return res.status(200).json({ success: true, todo });
    })
    .catch(error => res.json({ error }));
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server listening on port ${port}`));

module.exports = app;
