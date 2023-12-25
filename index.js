const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const exercises = [];
const users = [];
const logs = [];

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// body parser to have access to request.body
app.use(require("body-parser").urlencoded({ extended: false }));

app.post("/api/users", (req, res) => {
  const username = req.body.username;
  const _id = String(users.length);
  const newUser = {
    username,
    _id,
  };
  users.push(newUser);
  logs.push({
    username,
    count: 0,
    _id,
    log: [],
  });
  res.json(newUser);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.get("/api/exercises", (req, res) => {
  res.json(exercises);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = req.body.date
    ? new Date(req.body.date).toDateString()
    : new Date().toDateString();
  const _id = req.params._id;
  const user = users.find((item) => item._id == _id);
  const newExercise = {
    username: user.username,
    description,
    duration,
    date,
    _id,
  };
  exercises.push(newExercise);
  const log = logs.find((item) => item._id == _id);
  log.log.push({
    description,
    duration,
    date,
  });
  log.count = log.log.length;

  res.json(newExercise);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const id = req.params._id;
  const queryParams = req.query;
  const from = queryParams.from;
  const to = queryParams.to;
  const limit = queryParams.limit;
  let foundLog;

  const stringToDateToNumber = (str) => new Date(str).getTime();

  const validatePeriod = (arr, start, end) => {
    return arr.filter((item) => {
      const castedDate = stringToDateToNumber(item.date);
      const castedStart = stringToDateToNumber(start);
      const castedEnd = stringToDateToNumber(end);
      return castedDate > castedStart && castedDate < castedEnd;
    });
  };

  const validateLimit = (arr, limit) => arr.slice(0, limit);

  if (limit || (from && to)) {
    foundLog = { ...logs.find((item) => item._id == id) };
    if (limit) {
      foundLog.log = validateLimit(foundLog.log, limit);
    } else {
      foundLog.log = validatePeriod(foundLog.log, from, to);
    }
  } else {
    foundLog = { ...logs.find((item) => item._id == id) };
  }

  res.json(foundLog);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
