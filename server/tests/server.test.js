const expect = require("expect");
const request = require("supertest");
const Todo = require("../models/Todo");
const app = require("../server");

beforeEach(() => Todo.deleteMany({}));

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
            expect(todos.length).toBe(1);
            expect(todos[0].text).toEqual(text);
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
            expect(todos.length).toBe(0);
            done();
          })
          .catch(err => done(err));
      });
  });
});
