const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const Todo = require("./../../models/Todo");
const User = require("./../../models/User");

const userOneId = new ObjectId();
const userTwoId = new ObjectId();
const users = [
  {
    _id: userOneId,
    email: "xerxes@gmail.com",
    password: "userOnePass",
    tokens: [
      {
        access: "auth",
        token: jwt.sign({ _id: userOneId, access: "auth" }, "abc123").toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: "markcuban@gmail.com",
    password: "moneymoney"
  }
];

const todos = [
  {
    _id: new ObjectId(),
    text: "First todo item"
  },
  {
    _id: new ObjectId(),
    text: "Second todo item",
    completed: true,
    completedAt: 333
  }
];

const populateTodos = () =>
  Todo.deleteMany({}).then(() => Todo.insertMany(todos));

const populateUsers = () =>
  User.deleteMany({}).then(() => {
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  });

module.exports = { todos, populateTodos, users, populateUsers };
