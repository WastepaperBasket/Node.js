var router = require("express").Router();

router.get("/shirts", function (req, response) {
  response.send("셔츠 파는 페이지입니다.");
});
router.get("/pants", function (req, response) {
  response.send("바지 파는 페이지입니다.");
});

router.use("/shirts", loginCheck);

function loginCheck(req, response, next) {
  if (req.user) {
    // console.log("로그인체크 값" + req.user);
    next();
  } else {
    response.send("로그인 안하냐?");
  }
}
module.exports = router;
