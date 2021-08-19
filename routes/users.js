const express  = require("express");
let router = express.Router();

const { check } = require("express-validator");

const { ensureAuthenticated, forwardAuthenticated } = require("../middleware/auth");

const userController = require("../controllers/user");

/* GET users listing. */
router.post(
  "/register",
  [
    check("email", "Please enter a valid email").trim().isEmail(),
    check("name", "Name is required").trim().not().isEmpty(),
    check("lastname", "Last Name is required").trim().not().isEmpty(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  userController.registerUser
);

// Login
router.post(
  "/login",
  [
    check("email", "Please enter a valid email").trim().isEmail(),
    check("password", "Password is required").not().isEmail(),
  ],
  forwardAuthenticated,
  userController.loginUser
);

router.get("/logout", ensureAuthenticated, userController.logoutUser);

module.exports = router;
