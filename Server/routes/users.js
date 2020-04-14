const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post(
  "/signup",
  [
    check(
      "email",
      "Please include a valid email address"
    ).optional({checkFalsy: true})
      .isEmail(),
    check(
      "password",
      "Your password must be at least 8 characters long"
    ).isLength({min: 8}),
    check(
      "username",
      "Your username is definitely more than four characters. :-)"
    ).optional({checkFalsy: true})
      .isLength({min: 4}),
    check(
      "name",
      "Your name must be atleast 6 characters long"
    ).isLength({min: 3})
  ], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }

    const { email, username, name, password } = req.body;

    try {
      let user
      let existingEmail = User.findOne({email});
      let existingUsername = User.findOne({username})
      if (!existingEmail || !existingUsername) {
        return res.status(400).json({msg: "Oops, user already exists. choose another email or username"})
      }
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({
        name,
        email,
        username,
        password: hashedPassword
      })
      await user.save();
      res.json({msg: "Account successfully created"})
    } catch (err) {
      next(err);
    }
  })

module.exports = router;
