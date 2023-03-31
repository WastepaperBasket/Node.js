const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { response } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));
// npm install body-parser
app.set("view engine", "ejs");
//EJS npm install ejs

const MongoClient = require("mongodb").MongoClient;
//npm install mongodb@4.1 버전마다 다름.

app.use("/public", express.static("public")); //css

const methodOverride = require("method-override");
app.use(methodOverride("_method")); //npm install method-override

var db;

MongoClient.connect(
  "mongodb+srv://admin:qwer1234@cluster0.zap7sas.mongodb.net/mongonodeapp?retryWrites=true&w=majority", //기존 서버
  // mongodb://admin:qwer1234@svc.sel3.cloudtype.app:32622/?authMechanism=DEFAULT DB서버
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
  response.render("index.ejs");
});

app.get("/write", function (req, response) {
  response.render("write.ejs");
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

app.get("/detail/:id", function (req, response) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (error, result) {
      console.log(result);
      response.render("detail.ejs", { data: result }); //한번밖에못씀..
      if (error) return console.log(error);
      // response.status(200).send({ message: "서버이동" });
    }
  );
});

app.get("/edit/:id", function (req, response) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (error, result) {
      response.render("edit.ejs", { post: result });
      console.log(result);
      if (error) return console.log(error);
    }
  );
});

app.put("/edit", function (req, response) {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { title: req.body.title, Date: req.body.Date } },
    function (error, result) {
      console.log("수정완료" + result);
      response.redirect("/list");
    }
  );
});

//npm install passport passport-local express-session

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(session({ secret: "code", resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", function (req, response) {
  response.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  function (req, response) {
    response.redirect("/mypage");
  }
);

app.get("/mypage", loginCheck, function (req, response) {
  console.log(req.user);
  response.render("mypage.ejs", { 사용자: req.user });
});

function loginCheck(req, response, next) {
  if (req.user) {
    // console.log("로그인체크 값" + req.user);
    next();
  } else {
    response.send("로그인 안하냐?");
  }
}

const { ObjectId } = require("mongodb");
// ObjectID 안에 담고싶으면

app.post("/chatroom", loginCheck, function (req, response) {
  var save = {
    parent: req.body.parent,
    title: "chat",
    member: [ObjectId(req.body.당한id), req.user._id],
    date: new Date(),
  };

  db.collection("chatroom")
    .insertOne(save)
    .then((result) => {
      response.send("저장완료");
    });
});

app.get("/chat", loginCheck, function (req, response) {
  db.collection("chatroom")
    .find({ member: req.user._id })
    .toArray()
    .then((result) => {
      response.render("chat.ejs", { data: result });
    });
});

app.post("/message", loginCheck, function (req, response) {
  var savemessage = {
    parent: req.body.parent,
    userid: req.user._id,
    content: req.body.content,
    date: new Date(),
  };
  db.collection("message")
    .insertOne(savemessage)
    .then((result) => {
      console.log("DB저장 성공");
      response.send(result);
    });
});
app.get("/message/:_id", loginCheck, function (req, response) {
  response.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  db.collection("message")
    .find({ parent: req.params._id })
    .toArray()
    .then((result) => {
      console.log(result);
      response.write("event: test\n");
      response.write(`data: ${JSON.stringify(result)}\n\n`);
    });
});
passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      // console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne(
        { id: 입력한아이디 },
        function (에러, 결과) {
          if (에러) return done(에러);

          if (!결과)
            return done(null, false, { message: "존재하지않는 아이디요" });
          if (입력한비번 == 결과.pw) {
            return done(null, 결과);
          } else {
            return done(null, false, { message: "비번틀렸어요" });
          }
        }
      );
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (아이디, done) {
  db.collection("login").findOne({ id: 아이디 }, function (err, result) {
    done(null, result);
  });
});

/* Sign In insert */
app.post("/register", (req, response) => {
  db.collection("login").insertOne(
    { id: req.body.id, pw: req.body.pw },
    function (error, result) {
      response.redirect("/");
    }
  );
});

app.post("/add", (req, response) => {
  response.render("index.ejs");
  console.log(req.body.title);
  console.log(req.body.date);
  db.collection("counter").findOne(
    { name: "게시물갯수" },
    function (error, result) {
      console.log(result.totalPost);
      var tot = result.totalPost;
      var save = {
        title: req.body.title,
        Date: req.body.date,
        _id: tot + 1,
        usersave: req.user._id,
      };
      db.collection("post").insertOne(save, function (error, result) {
        console.log("complete!");
        db.collection("counter").updateOne(
          { name: "게시물갯수" },
          { $inc: { totalPost: 1 } },
          function (error, result) {
            if (error) return console.log(error);
          }
        );
      });
    }
  );
});
// 요청 응답 ····.
app.delete("/delete", function (req, response) {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);

  var userDate = { _id: req.body._id, usersave: req.user._id };

  db.collection("post").deleteOne(userDate, function (error, result) {
    if (error) console.log(error);
    console.log("삭제완료");
    response.status(200).send({ message: "성공했습니다." });
  });
});
/* full scean */
// app.get("/search", (req, response) => {
//   console.log(req.query.value);
//   db.collection("post")
//     .find({ title: req.query.value })
//     .toArray((error, result) => {
//       console.log(result);
//       response.render("search.ejs", { result: result });
//     });
// });

// app.get("/search", (req, response) => {
//   console.log(req.query.value);
//   db.collection("post")
//     .find({ $text: { $search: req.query.value } })
//     .toArray((error, result) => {
//       console.log(result);
//       response.render("search.ejs", { result: result });
//     });
// });

app.get("/search", (req, response) => {
  console.log(req.query.value);
  var 검색조건 = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: req.query.value,
          path: ["title", Date], // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 5 },
    // { $porject: {제목 : 1 , _id : 0 , score : {$meta : "searchScore"}} }, //검색조건 필터주기
  ];
  db.collection("post")
    .aggregate(검색조건)
    .toArray((error, result) => {
      console.log(result);
      response.render("search.ejs", { result: result });
    });
});

app.use("/shop", require("./routes/shop.js"));

app.use("/board/sub", require("./routes/board.js"));

// npm install multer

let multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/image");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //+ '날짜' new Date()
  },
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(new Error("PNG, JPG만 업로드하세요"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});

var upload = multer({ storage: storage });

app.get("/upload", (req, response) => {
  response.render("upload.ejs");
});

app.post("/upload", upload.single("photo"), function (req, response) {
  response.send("사진업로드 완료");
});
//upload.array('inputname', 받을 최대 갯수)
//input에 관해서도 html 속성 변경해야함.

app.get("/image/:imageName", function (req, response) {
  response.sendFile(__dirname + "/public/image/" + req.params.imageName);
});
