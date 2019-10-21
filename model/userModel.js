const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
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
  password: {
    type: String,
    required: true
  },
  userImage: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  country: {
    type: String
  },
});

module.exports = mongoose.model('user', userSchema);