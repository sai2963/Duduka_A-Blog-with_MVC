const express = require("express");
const router = express.Router();
const xss = require("xss");



const Blogcontroller = require("../controllers/blog-controllers");

const bodyParser = require("body-parser");
const multer = require("multer");

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storageConfig });
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use((req, res, next) => {
  if (req.session.isAuthenticated) {
    res.locals.user = req.session.user;
  }
  next();
});

router.get("/home", Blogcontroller.getHome);

router.get("/signup", Blogcontroller.getSignup);

router.get("/login", Blogcontroller.getLogin);

router.get("/admin", Blogcontroller.getadmin);
router.get("/404", Blogcontroller.get404);

router.get("/home/blog/:id", Blogcontroller.getblog);

router.get("/401");

router.post("/signup", Blogcontroller.postSignup);

router.post("/login", Blogcontroller.postLogin);

router.post("/logout" ,Blogcontroller.postLogout);

router.post("/submit", upload.single("image"), Blogcontroller.postSubmit);

module.exports = router;
