const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// npm install body-parser

app.listen(8080, function () {
  console.log("Hello world! Listening on 8080");
});

app.get("/pet", function (req, response) {
  response.send("펫 쇼핑사이트 입니다.");
});

app.get("/beauty", function (req, response) {
  response.send("뷰티 사이트 입니다.");
});

app.get("/", function (req, response) {
  response.sendFile(__dirname + "/index.html");
});

app.get("/write", function (req, response) {
  response.sendFile(__dirname + "/write.html");
});

app.post("/add", (req, response) => {
  response.sendFile(__dirname + "/index.html");
  console.log(req.body.title);
  console.log(req.body.date);
  // REST API ?
  // DB ?
});
