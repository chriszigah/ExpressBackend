var express = require("express");
const router = express.Router();

//Routes
var usersRoutes = require("../routes/users");
var profileRoutes = require("../routes/profile");
var postRoutes = require("../routes/post");

const { ensureAuthenticated, forwardAuthenticated } = require("../middleware/auth");

router.get("/get-session", ensureAuthenticated, (req, res) => {
  const user = req.user;
  return res.status(200).json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
    },
  });
});

router.get("/success_login", (req, res, next) => {
  res.status(200).json({
    isAuth: true,
    message: "Login in was successfull",
  });
});

router.get("/unsuccess_login", (req, res, next) => {
  res.status(400).json({
    isAuth: false,
    message: "Invalid Email/Password Combination",
  });
});

router.use("/user", usersRoutes);
router.use("/profile", profileRoutes);
router.use("/post", postRoutes);

module.exports = router;
