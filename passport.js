const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const mongoose = require("mongoose");
const passport = require("passport");

const User = require("./model/userModel");
const key = require("./keys");

// options object
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = key.secret;

// JWT strategy
module.exports = passport.use("jwt",
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
      .then(user => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch(err => console.log(err));
    })
  )


// Google strategy
module.exports = passport.use("google",
    new GoogleStrategy({
      clientID: key.googleOAuthClientID,
      clientSecret: key.googleOAuthClientSecret,
      callbackURL: "http://localhost:5000/user/google/redirect"
    },
    function(accessToken, refreshToken, profile, cb) {

      console.log("passport");


      // TODO: search user in DB.
        // add if necessary?
        // add already here? what if login w/ google fails?
        // then he would not be able to create account w/o google,
        // because the email would already be in db

      // also: no verification email -> problem? registering w/
        // s.o. elses email, then he logs in with google



      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });



    })
  )

