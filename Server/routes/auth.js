const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const authenticator = require("../middlewares/Authenticator");
const jwtSecret = process.env.JWT_SECRET;

router.get("/", authenticator, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(["-password", "-_id", "-date", "-__v"]);

    res.json({msg: "User authenticated", user});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post(
  "/",
  [
    check(
      "email",
      "Please include a valid email address"
    ).optional({ checkFalsy: true })
      .isEmail(),
    check(
      "username",
      "Enter your account username"
    ).optional({ checkFalsy: true})
      .isLength({ min: 4}),
    check(
      "password",
      "Your password must be at least 5 characters long"
    ).isLength({ min: 5 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()})
    }

    const { username, email, password } = req.body;
    console.log(req.header.Authorization)

    try {
      let user;
      if (username) {
        const findUsername = await User.findOne({ username});
        if (!findUsername) {
          return res.status(400).json({msg: "Invalid username. User not found"});
        }
        user = findUsername;
      }
      if (email) {
        const findEmail = await User.findOne({ email });
        if (!findEmail) {
          return res.status(400).json({msg: "Invalid email. User not found"});
        }
        user = findEmail
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({msg: "Password is incorrect!"})
      }

      const payload = {
        user: {
          id: user.id,
          name: user.name
        }
      };

      jwt.sign(payload, jwtSecret, {expiresIn:36000}, (err, token) => {
        if (err) throw err;
        res.json({ token, msg: "Logged in succeessfully. "});
      });
    } catch (err) {
      console.log(err)
    }
  }
);

module.exports = router;
