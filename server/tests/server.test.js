const expect = require("expect");
const request = require("supertest");
const { ObjectId } = require("mongodb");
const Todo = require("../models/Todo");
const app = require("../server");

const todos = [
  {
    _id: new ObjectId(),
    text: "First todo item"
  },
  {
    _id: new ObjectId(),
    text: "Second todo item"
  }
];

const validNonexistentId = "5b805e811de402279a335d79";

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

describe("GET /todos/:id", () => {
  it("should return todo doc", done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should return 404 if todo not found", done => {
    request(app)
      .get(`/todos/${validNonexistentId}`)
      .expect(404)
      .expect(res => {
        expect(res.body).toEqual({ error: "No todo found" });
      })
      .end(done);
  });

  it("should return 404 if for invalid ids", done => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .expect(res => {
        expect(res.body.error).toBe("Not a valid ID");
      })
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should find and delete todo", done => {
    request(app)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
      })
      .end(done);
  });

  it("should return 404 if todo not found", done => {
    request(app)
      .delete(`/todos/${validNonexistentId}`)
      .expect(404)
      .expect(res => {
        expect(res.body).toEqual({ error: "No such todo was found" });
      })
      .end(done);
  });

  it("should return 404 if object id is invalid", done => {
    request(app)
      .delete(`/todos/123abc`)
      .expect(404)
      .expect(res => {
        expect(res.body).toEqual({ error: "Not a valid ID" });
      })
      .end(done);
  });
});

describe("PATCH /todos/:id", () => {
  it("should update a todo", done => {
    const text = "New Text";

    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({ text, completed: true, completedAt: 123 })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toEqual(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe("number");
      })
      .end(done);
  });

  it("should clear completedAt when todo is not completed", done => {
    const text = "New Text";

    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({ text, completed: false })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toEqual(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end(done);
  });
});
