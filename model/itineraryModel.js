const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true
  },
  profilePicuture: {
    type: String 
  },
  author: {
    type: String
  },
  likes: {
    type: Number
  },
  duration: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  hashtags: {
    type: [String]
  }
});

module.exports = mongoose.model('itinerary', itinerarySchema);