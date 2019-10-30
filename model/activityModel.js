const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,

    // unique titles to avoid mixing up activities from different cities
      // in redux store. alternative: store them relativ to city
    unique: true,
  },
  city: {
    type: String,
    required: true
  },
  itinerary: {
    type: String,
    required: true
  },
  img: {
   type: String 
  }
});

module.exports = mongoose.model('activity', activitySchema);