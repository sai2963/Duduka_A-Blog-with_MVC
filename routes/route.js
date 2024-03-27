const express = require("express");
const router = express.Router();
const xss = require("xss");
const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");
const db = require("../data/database");
const ObjectId = mongodb.ObjectId;
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

router.get("/home", async (req, res) => {
  try {
    const data = await db.getDb().collection("blogdata").find().toArray();

    console.log(data);
    res.render("home", { data: data, req: req });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/signup", (req, res) => {
  res.render("signup", { req: req });
});

router.get("/login", (req, res) => {
  res.render("login", { req: req });
});

router.get("/admin", (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(404).render("404");
  }
  res.render("admin", { req: req });
});
router.get("/404", (req, res) => {
  res.render("404", { req: req });
});

router.get("/home/blog/:id", async (req, res) => {
  const blogId = req.params.id;
  if (!ObjectId.isValid(blogId)) {
    return res.status(404).render("401");
  }

  try {
    const detail = await db
      .getDb()
      .collection("blogdata")
      .findOne({ _id: new ObjectId(blogId) });
      console.log(detail)
    if (!detail) {
      return res.status(404).render("401");
    }
    
    res.render("blog", { detail: detail, req: req });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/401", (req, res) => {
  res.render("401", { req: req });
});

router.post("/signup", async (req, res) => {
  const userdata = req.body;
  const username = userdata.name;
  const useremail = userdata.email;
  const userpassword = userdata.password; // Fix typo, should be password, not email
  const enteredpassword = userpassword.trim();

  if (enteredpassword.length < 8 || !useremail.includes("@")) {
    req.session.inputData = {
      hasError: true,
      message: "Invalid input - please check your data",
      name:username,
      email: useremail,
      password: enteredpassword,
    };
    return res.redirect("/signup");
  }

  const existinguser = await db
    .getDb()
    .collection("users")
    .findOne({ email: useremail });

  if (existinguser) {
    console.log("User already registered");
    return res.redirect("/signup");
  }

  const hashedPassword = await bcrypt.hash(enteredpassword, 12);

  const user = {
    name: username,
    email: useremail,
    password: hashedPassword,
  };

  await db.getDb().collection("users").insertOne(user);
  res.redirect("/login");
});

router.post("/login", async (req, res) => {
  const userdata = req.body;
  const useremail = userdata.email;
  const userpassword = userdata.password;

  const existinguser = await db
    .getDb()
    .collection("users")
    .findOne({ email: useremail });

  if (!existinguser) {
    console.log("User not found");
    return res.redirect("/login");
  }

  const passwordAreEqual = await bcrypt.compare(
    userpassword,
    existinguser.password
  );

  if (!passwordAreEqual) {
    console.log("Password incorrect");
    return res.redirect("/login");
  }
  req.session.user = { id: existinguser._id, email: existinguser.email ,username: existinguser.name};
  req.session.isAuthenticated = true;
  req.session.save(function () {
    res.redirect("/admin");
  });
  console.log("User Authenticated");
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/home"); // Redirect to home page after logout
    }
  });
});

router.post("/submit", upload.single("image"), async (req, res) => {
  const blogdata = req.body;
  const blogImagefile = req.file;
  const blogtitle = blogdata.title;
  const blogcontent = blogdata.content;
  const username = req.session.user ? req.session.user.username : "Anonymous";
  const Blogdata = {
    username: username,
    title: blogtitle,
    image: blogImagefile.path,
    content: blogcontent,
  };
  await db.getDb().collection("blogdata").insertOne(Blogdata);
  res.redirect("home");
});



module.exports = router;
