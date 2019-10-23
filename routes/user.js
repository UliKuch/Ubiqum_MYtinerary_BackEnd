const express = require("express");
const router = express.Router();

const userModel = require("../model/userModel")

// bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

// express-validator
const { check, validationResult } = require('express-validator');

// secret key for JWT
const key = require('../keys');
const jwt = require("jsonwebtoken")


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

  // hash password (sync)
  // sync might block event loop, but hashed pw is needed for post request
  // (see https://www.npmjs.com/package/bcrypt)
  const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);

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
  userModel.find({$or: [{username: newUser.username},{email: newUser.email}]})
  .then(data => {
    if (data.length > 0) {
      console.log(data);
      res.status(409).send("A user with this username and/or this email already exists.");
    }
    
    // if username and email do not exist yet, add newUser to db
    newUser.save()
    .then(user => {
      res.send(user)
    })
    .catch(err => {
      res.status(500).send("Server error")
    })
  })
}
)


// POST login
module.exports = router.post("/login", [

  // Server-side validation
  check("password").isLength({ min: 8 }),

], (req, res) => {

  // Find validation errors and wrap them in object
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  // store data from request in variables
  const username = req.body.username;
  const plaintextPassword = req.body.password;

  // check if username exist
  userModel.find({ username: username })
  .then(data => {
    
    // send error if username does not exist
    if (data.length < 1) {
      console.log(data);
      res.status(404).send("User not found in database.");
    }
    
    // store user in variable
    const user = data[0];

    // sync check if pw is correct
    // TODO: change to async check
    console.log("Checking password...");
    if (!bcrypt.compareSync(plaintextPassword, user.password)) {
      console.log("Password incorrect");
      res.status(401).send("Password is incorrect.");
    }
    console.log("Password correct");

    // create JWT payload
    const payload = {
      id: user._id,
      username: user.username,
      userImage: user.userImage
    };
    const options = {expiresIn: 2592000};

    // sign token
    jwt.sign(
      payload,
      key.secret,
      options,
      (err, token) => {
        if (err) {
          res.json({
            success: false,
            token: "There was an error"
          });
        } else {
          res.json({
            success: true,
            token: token
          });
        }
      }
    );
  })
}
)

// passport and passport middleware
const app = express();
const passport = require("passport");
// passport middleware
app.use(passport.initialize());
// passport configuration
require("../passport.js")(passport);


// GET check if user is logged in
module.exports = router.get("/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    userModel
      .findOne({ _id: req.user.id })
      .then(user => {
        res.json(user);
      })
      .catch(err => res.status(404).json({ error: "User does not exist!" }));
  }
);