const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  googleLogin: {
    type: Boolean
  },
  password: {
    type: String,
    // Only required if no google login
    // see https://github.com/Automattic/mongoose/issues/5119
    required: function() {return !this.googleLogin},
  },
  userImage: {
    type: String
  },
  country: {
    type: String
  },
});

module.exports = mongoose.model('user', userSchema);