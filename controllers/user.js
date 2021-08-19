var { User } = require("../models/user");
var bcrypt = require("bcrypt");
var passport = require("passport");
var { Login } = require("../models/login");
var { validationResult } = require("express-validator");

exports.registerUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation Failed",
      error: errors.errors,
    });
  }

  const { email, password, name, lastname } = req.body;

  const user = new User({
    email,
    password,
    name,
    lastname,
  });

  user.save((err, doc) => {
    if (err) {
      console.log(err);
      return res.status(422).json({
        message: "Email Already Exist",
        success: false,
      });
    }
    if (doc) {
      bcrypt.hash(password, 12, (_err, hashedPw) => {
        const login = new Login({
          userid: doc._id,
          password: hashedPw,
        });
        login.save((_err, result) => {
          if (result) {
            return res.status(201).json({
              success: true,
              message: "user Created",
            });
          }
        });
      });
    }
  });
};

exports.loginUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation Failed",
      error: errors.errors,
    });
  }
  passport.authenticate("local", {
    successRedirect: "/success_login",
    failureRedirect: "/unsuccess_login",
  })(req, res, next);
};

exports.logoutUser = (req, res) => {
  req.logout();
  req.session.destroy(() => {
    res.clearCookie(process.env.SESSION_COOKIE_NAME);
    res.status(200).json({
      isAuth: false,
      message: "successfuly logged out",
    });
  });
};
