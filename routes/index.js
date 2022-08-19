var express = require("express");
var router = express.Router();
var checks = require("./db");

var creError = [{ msg: "Invalid Credentials" }];
var userError = [{ msg: "Pick Another Name" }]

router.get("/", checks.et_link, function (req, res, next) {
  console.log("c")
  res.render("index", { title: "Linktree", auth: req.session.auth });
});

router.get("/logout", function (req, res, next) {
  req.session.auth = null;
  res.redirect("../");
});

/* GET home page. */
router.get("/login", function (req, res, next) {
  if (req.session.auth != null) {
    res.redirect(`/users/${req.session.auth}`);
    req.session.errors = null;
  } else {
    res.render("login", {
      auth: req.session.auth,
      title: "Login",
      success: req.session.success,
      errors: req.session.errors,
    });
    req.session.errors = null;
  }
});

router.post("/login", function (req, res, next) {
  console.log(req.session.a)
  req.check("username","Enter a proper Email ID").isEmail().isLength({ max: 255 });
  req.check("password", "Password is invalid").isLength({ min: 8 });

  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    req.session.success = false;
  } else {
    req.session.success = true;
    callback(req, res);
    return 0;
  }
  res.redirect("/login");
  return 0;
});

router.get("/login/register", function (req, res, next) {
  if (req.session.auth) {
    req.session.regerrors = null;
    req.session.regerrorsextra = null;
    res.redirect(`/users/${req.session.auth}`);
  } else {
    res.render("register", {
      title: "Register",
      auth: req.session.auth,
      errors: req.session.regerrors,
      errors2: req.session.regerrorsextra,
    });
    req.session.regerrors = null;
    req.session.regerrorsextra = null;
  }
});

router.post("/login/register", function (req, res, next) {
  req.session.regerrors = null;
  req.session.regerrorsextra = null;
  if (req.session.auth) {
    res.redirect(`/users/${req.session.auth}`);
    return 0;
  }
  req.check("username","Enter a proper Email ID").isEmail();
  req.check("name", "Name is not alpha").isAlpha();
  req
    .check("password", "Password should be atleast 8 Char")
    .isLength({ min: 8 });
  req
    .check("password", "Password doesn't match Confirm Passowrd")
    .equals(req.body.confirmPassword);
  req.session.regerrors = req.validationErrors();
  callback2(req, res);
});

async function callback(req, res,next) {
  let salting = await checks.et_details(req.body.username)[0].salt
  let profile =  await checks.check_username(
    req.body.username,
    req.body.password,
    salting
  );
  if (profile[0] == undefined) {
    req.session.success = false;
    req.session.errors = creError;
    res.redirect("/login");
  } else {
    req.session.auth = profile[0].name;
    res.redirect(`/users/${profile[0].name}`);
  }
}

async function callback2(req, res) {
  let result = await checks.get_details(req.body.name);
  console.log("a",result);
  if (
    result[0] === undefined &&
    req.session.regerrors === false &&
    req.session.regerrorsextra === null
  ) {
    req.session.regerrorsextra = await checks.adduser(req.body);
    if (req.session.regerrorsextra) {
      req.session.success = true;
      req.session.auth = req.body.name;
      res.redirect(`/users/${req.body.name}`);
    } else {
      req.session.regerrors =  (userError);
      res.redirect("/login/register");
    }
  } else {
    if (result[0] != undefined) {
      if (result[0].name === req.body.name) {
        req.session.regerrors =  (userError);
      }
    }
    res.redirect("/login/register");
  }
}

module.exports = router;
