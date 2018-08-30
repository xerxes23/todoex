const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

// DB
require("./config/config");
const { ObjectId } = require("mongodb");
const mongoose = require("./db/mongoose");
const Todo = require("./models/Todo");
const User = require("./models/User");
const authenticate = require("./middleware/authenticate");

// Server

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root route
app.get("/", (req, res) => {
  res.send("Hello");
});

// POST /todos
app.post("/todos", authenticate, (req, res) => {
  const newTodo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  newTodo
    .save()
    .then(todo => res.status(200).json({ success: true, todo }))
    .catch(err => res.status(400).json({ success: false, error: err }));
});

// GET /todos
app.get("/todos", authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id })
    .then(todos => res.status(200).json({ success: true, todos }))
    .catch(err => res.status(400).json({ success: false, error: err }));
});

// GET /todos/:id
app.get("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Not a valid ID" });
  }
  Todo.findOne({
    _id: id,
    _creator: req.user._id
  })
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ error: "No todo found" });
      }
      return res.status(200).json({ success: true, todo });
    })
    .catch(error => res.status(404).json({ error }));
});

// DELETE /todos
app.delete("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Not a valid ID" });
  }
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  })
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ error: "No such todo was found" });
      }
      return res.status(200).json({ success: true, todo });
    })
    .catch(error => res.status(404).json({ error }));
});

// PATCH /todos/:id
app.patch("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Not a valid ID" });
  }
  Todo.findOne({
    _id: id,
    _creator: req.user._id
  })
    .then(todo => {
      if (!todo) {
        return res.status(404).json({ error: "No such todo was found" });
      }
      const updatedTodo = {
        text: req.body.text ? req.body.text : todo.text,
        completed: req.body.completed ? req.body.completed : todo.completed,
        completedAt: req.body.completed ? new Date().getTime() : null
      };
      Todo.findByIdAndUpdate(id, updatedTodo, { new: true }).then(todo =>
        res.status(200).json({ success: true, todo })
      );
    })
    .catch(error => res.json({ error }));
});

// POST /users
app.post("/users", (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);
  const user = new User(body);
  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).send(user);
    })
    .catch(error => res.status(400).json({ error }));
});

// GET /users/me PRIVATE

app.get("/users/me", authenticate, (req, res) => {
  res.send(req.user);
});

// POST /users/login
app.post("/users/login", (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);

  User.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        return res.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send("Unatheticated");
    });
});

// DELETE /users/me/token
app.delete("/users/me/token", authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

module.exports = app;
