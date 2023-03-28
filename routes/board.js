var router = require("express").Router();

router.get("/sports", function (req, response) {
  response.send("스포츠 게시판");
});

router.get("/game", function (req, response) {
  response.send("게임 게시판");
});

router.use("/game", loginCheck);
function loginCheck(req, response, next) {
  if (req.user) {
    // console.log("로그인체크 값" + req.user);
    next();
  } else {
    response.send("로그인 안하냐?");
  }
}

module.exports = router;
