const express = require("express");
const app = express();

app.listen(8080, function () {
  console.log("Hello world! Listening on 8080");
});

app.get("/pet", function (req, response) {
  response.send("펫 쇼핑사이트 입니다.");
});

app.get("/beauty", function (req, response) {
  response.send("뷰티 사이트 입니다.");
});

//server close ctrl + c
