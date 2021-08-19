var passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var bcrypt = require("bcrypt");
var { Login } = require("../models/login");

var { User } = require("../models/user");

module.exports = function initAuthMiddleware(app) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then((user) => {
        if (!user) {
          return done(null, false, { message: "Email not Register" });
        }
        // Match password
        Login.findOne({
          userid: user._id
        })
          .then((loginUser) => {
            bcrypt.compare(password, loginUser.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, {
                  message: "Wrong Email/Password Combination"
                });
              }
            });
          })
          .catch((err) => {
            return done(null, false, {
              message: "Auth failed - Wrong Email/Password Combination"
            });
          });
      });
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  app.use(passport.initialize());
  app.use(passport.session());
};
