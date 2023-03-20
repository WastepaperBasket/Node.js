const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// npm install body-parser
app.set("view engine", "ejs");
//EJS npm install ejs

const MongoClient = require("mongodb").MongoClient;
//npm install mongodb@4.1 버전마다 다름.

var db;

MongoClient.connect(
  "mongodb+srv://admin:qwer1234@cluster0.zap7sas.mongodb.net/mongonodeapp?retryWrites=true&w=majority",
  function (error, client) {
    if (error) return console.log(error);

    db = client.db("mongonodeapp");

    // db.collection("post").insertOne(
    //   { Name: "Pdy", age: 20 },
    //   function (error, result) {
    //     console.log("complete!");
    //   }
    // );

    app.listen(8080, function () {
      console.log("Hello world! Listening on 8080");
    });
  }
);

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
  db.collection("counter").findOne(
    { name: "게시물갯수" },
    function (error, result) {
      console.log(result.totalPost);
      var tot = result.totalPost;

      db.collection("post").insertOne(
        { title: req.body.title, Date: req.body.date, _id: tot + 1 },
        function (error, result) {
          console.log("complete!");
          db.collection("counter").updateOne(
            { name: "게시물갯수" },
            { $inc: { totalPost: 1 } },
            function (error, result) {
              if (error) return console.log(error);
            }
          );
        }
      );
    }
  );
});

app.get("/list", function (req, response) {
  //All date
  db.collection("post")
    .find()
    .toArray(function (error, result) {
      console.log(result);
      response.render("list.ejs", { posts: result });
    });

  // response.render("list.ejs"); // views file?
});
