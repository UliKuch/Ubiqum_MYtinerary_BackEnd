const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
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