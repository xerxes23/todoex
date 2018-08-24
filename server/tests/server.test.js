const expect = require("expect");
const request = require("supertest");
const Todo = require("../models/Todo");
const app = require("../server");

const todos = [
  {
    text: "First todo item"
  },
  {
    text: "Second todo item"
  }
];

beforeEach(() => Todo.deleteMany({}).then(() => Todo.insertMany(todos)));

describe("POST /todos", () => {
  it("should create a new todo", done => {
    const text = "Test todo text";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toEqual(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({})
          .then(todos => {
            expect(todos.length).toBe(3);
            expect(todos[2].text).toEqual(text);
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should not add an invalid todo", done => {
    const text = "";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({})
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe("GET /todos", () => {
  it("should return all todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});
