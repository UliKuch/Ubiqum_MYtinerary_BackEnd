const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const mongoose = require("mongoose");
const passport = require("passport");

// enable reading from .env file
require("dotenv").config();

const User = require("./model/userModel");

// options object for jwt
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

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


// options object for google
const url = process.env.URL
const googleOpts = {};
googleOpts.clientID = process.env.GOOGLE_OAUTH_CLIENT_ID;
googleOpts.clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
googleOpts.callbackURL = `${url}/user/google/redirect`;

// Google strategy
module.exports = passport.use("google",
  new GoogleStrategy(googleOpts,
  async function(accessToken, refreshToken, profile, cb) {
  // the functions part is not accessed by the google login route,
  // but by the passport call in the redirect route
  // bec only the redirect call includes user data

    // store user values received from google 
    const lastName = profile.name.familyName
    const firstName= profile.name.givenName
    const userImage = profile.photos[0].value
    const email = profile.emails[0].value
    
    try {
      // values for finding/creating user in db
      const filter = { email: email };
      const update = {
        firstName: firstName,
        lastName: lastName,
        userImage: userImage,
        googleLogin: true,
        isLoggedIn: true
      }
      
      // Check if user already exist (throws 0 or 1)
      const checkIfNew = await User.countDocuments(filter);
    
      // If user does not exist yet, user will be created
      // if user already exists, his entry will be *updated*
      // according to update above.
      let user = await User.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true // Make this update into an upsert
      });

      // if user exists, it gets handed to the function part
      // of the redirect route (as req.user)
      if (user) {
        return cb(null, user)
      } else {
        return cb(null, false)
      }

    } catch (error) {
      console.error(error);
    }
  })
)

