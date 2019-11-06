const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  city: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String 
  },
  authorId: {
    type: String
  },
  authorUsername: {
    type: String
  },
  authorEmail: {
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
  },
  comments: [{
    body: {
      type: String,
      required: true
    },
    authorId: {
      type: String,
      required: true
    },
    authorUsername: {
      type: String
    },
    authorEmail: {
      type: String
    },
    date: {
      type: Date,
      required: true
    },
    lastUpdateAt: {
      type: Date
    }
  }]
});

module.exports = mongoose.model('itinerary', itinerarySchema);