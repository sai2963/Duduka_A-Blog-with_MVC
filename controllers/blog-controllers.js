const { ObjectId } = require("mongodb");
const Blog = require("../model/blog");
const bcrypt = require("bcryptjs");
const db = require("../data/database");
async function getHome(req, res)  {
    try {
      const data = await Blog.fetchAll();
  
      console.log(data);
      res.render("home", { data: data, req: req });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };

  function getSignup(req, res) {
    res.render("signup", { req: req });
  };


  function getLogin(req, res)  {
    res.render("login", { req: req });
  };

  function getAdmin(req, res)  {
    if (!req.session.isAuthenticated) {
      return res.status(404).render("404");
    }
    res.render("admin", { req: req });
  };
  
  function get404(req, res)  {
    res.render("404", { req: req });
  };

 async function getblog(req, res)  {
    const blogId = req.params.id;
    if (!ObjectId.isValid(blogId)) {
      return res.status(404).render("401");
    }
  
    try {
      const detail = await Blog.fetchById(blogId);
      if (!detail) {
        return res.status(404).render("401");
      }
      
      res.render("blog", { detail: detail, req: req });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };

  function get401(req, res)  {
    res.render("401", { req: req });
  };

  async function postSignup(req, res)  {
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
  };

  async function postLogin (req, res)  {
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
  };


  function postLogout(req, res)  {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/home"); 
      }
    });
  };

  async function postSubmit (req, res)  {
    const blogdata = req.body;
    const blogImagefile = req.file;
    const blogtitle = blogdata.title;
    const blogcontent = blogdata.content;
    const username = req.session.user ? req.session.user.username : "Anonymous";
    
    const blog=new Blog(username,blogtitle,blogImagefile,blogcontent);
    await blog.save();
  
    // const Blogdata = {
    //   username: username,
    //   title: blogtitle,
    //   image: blogImagefile.path,
    //   content: blogcontent,
    // };
    // await db.getDb().collection("blogdata").insertOne(Blogdata);
    res.redirect("home");
  };
  


  module.exports={
    getHome:getHome,
    getSignup:getSignup,
    getLogin:getLogin,
    getadmin:getAdmin,
    get404:get404,
    getblog:getblog,
    get401:get401,
    postSignup:postSignup,
    postLogin:postLogin,
    postLogout:postLogout,
    postSubmit:postSubmit

  }