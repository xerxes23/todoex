const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb://localhost:27017/TodoApp",
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Unable to connect MongoDB"));

module.exports = mongoose;
