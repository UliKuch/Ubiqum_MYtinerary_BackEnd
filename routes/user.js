const express = require("express");
const router = express.Router();

const userModel = require("../model/userModel")

// bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

// express-validator
const { check, validationResult } = require('express-validator');

// POST new user
module.exports = router.post("/", [

  // Server-side validation
  check("password").isLength({ min: 8 }),
  check("email").isEmail()

], (req, res) => {

  // Find validation errors and wrap them in object
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  // hash password
  let hashedPassword;
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
        hashedPassword = hash;
    });
  });

  // create new user object from POST request, following schema
  const newUser = new userModel({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashedPassword,
    userImage: req.body.userImage,
    email: req.body.email,
    country: req.body.country
  });

  // check if username or email already exist
  userModel.find({$or: [{username: newUser.name},{email: newUser.email}]})
  .then(data => {
    if (data.length > 0) {
      console.log(data);
      res.status(409).send("A user with this username already exists.");
    }
    
    // if username and email do not exist yet, add newUser to db
    else {
      newUser.save()
      .then(user => {
        res.send(user)
      })
      .catch(err => {
        res.status(500).send("Server error")
      })
    }
  })
}
)