const expect = require("expect");
const request = require("supertest");
const { ObjectId } = require("mongodb");
const Todo = require("../models/Todo");
const User = require("../models/User");
const app = require("../server");

const { todos, populateTodos, users, populateUsers } = require("./seed/seed");

const validNonexistentId = "5b805e811de402279a335d79";

beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe("GET /users/me", () => {
  it("should return user if authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("should return 401 if not authenticated", done => {
    request(app)
      .get("/users/me")
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe("POST /users", () => {
  it("shoud create a user", done => {
    const email = "example@gmail.com";
    const password = "123qwerty";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBeTruthy();
      })
      .end(err => {
        if (err) {
          return done(err);
        }

        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should return validation error if request invalid", done => {
    const invalidEmail = "joe.com";
    const password = "123abc";

    request(app)
      .post("/users")
      .send({ email: invalidEmail, password })
      .expect(400)
      .end(done);
  });

  it("should not create a user if email in use", done => {
    const usedEmail = "xerxes@gmail.com";
    const password = "123abc";

    request(app)
      .post("/users")
      .send({ email: usedEmail, password })
      .expect(400)
      .end(done);
  });
});

describe("POST /users/login", () => {
  it("should login user and return auth token", done => {
    request(app)
      .post("/users/login")
      .send({ email: users[1].email, password: users[1].password })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done();
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[0]).toInclude({
              access: "auth",
              token: res.headers["x-auth"]
            });
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should reject invalid login", done => {
    request(app)
      .post("/users/login")
      .send({ email: users[1].email, password: users[1].password + "o" })
      .expect(400)
      .expect(res => {
        expect(res.headers["x-auth"]).not.toBeTruthy();
      })
      .end(done);
  });
});

describe("DELETE /users/me/token", () => {
  it("should remove auth token on logout", done => {
    request(app)
      .delete("/users/me/token")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      });
  });
});
