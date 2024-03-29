const express = require("express");
const router = express.Router();
const xss = require("xss");
const bcrypt = require("bcryptjs");


const Blogcontroller = require("../controllers/blog-controllers");

const bodyParser = require("body-parser");
const multer = require("multer");
const blogControllers = require("../controllers/blog-controllers");
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

router.get("/home", blogControllers.getHome);

router.get("/signup", blogControllers.getSignup);

router.get("/login", blogControllers.getLogin);

router.get("/admin", blogControllers.getadmin);
router.get("/404", blogControllers.get404);

router.get("/home/blog/:id", blogControllers.getblog);

router.get("/401");

router.post("/signup", blogControllers.postSignup);

router.post("/login", blogControllers.postLogin);

router.post("/logout");

router.post("/submit", upload.single("image"), blogControllers.postSubmit);

module.exports = router;
