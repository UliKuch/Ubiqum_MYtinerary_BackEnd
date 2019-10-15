const express = require("express");
const router = express.Router();

const cityModel = require("../model/cityModel")
const itineraryModel = require("../model/itineraryModel")
const activityModel = require("../model/activityModel")


// GET test route
module.exports = router.get("/test", (req, res) => {
  res.send({ msg: "Cities test route." })
})


// GET all cities
module.exports = router.get("/all",
  (req, res) => {
    cityModel.find({})
      .then(files => {
        res.send(files)
      })
      .catch(err => console.log(err));
  }
);

// GET specific city
module.exports = router.get("/:name",
	(req, res) => {
      let cityRequested = req.params.name;
      cityModel.findOne({ name: cityRequested })
			.then(city => {
        res.send(city)
      })
			.catch(err => console.log(err));
});

// GET itineraries for specific city
module.exports = router.get("/:name/itineraries",
	(req, res) => {
    const cityRequested = req.params.name;
    cityModel.findOne({ name: cityRequested })
    .then(city => {
      itineraryModel.find({ city: city.name })
      .then(itineraries => {
        res.send(itineraries)
      })
      .catch(err => console.log(err))
    })
    .catch(err => console.log(err));
});

// GET activities for specific itinerary
module.exports = router.get("/:name/itineraries/:itinerary",
  (req, res) => {
    const cityRequested = req.params.name;
    const itinRequested = req.params.itinerary;
    // no checks whether city and itinerary are in database necessary
    activityModel.find({ city: cityRequested, itinerary: itinRequested })
      .then(activities => {
        res.send(activities)
      })
      .catch(err => console.log(err))
})

// POST new city
module.exports = router.post("/",
  (req, res) => {

    // create new city object from POST request, following schema
    const newCity = new cityModel({
        name: req.body.name,
        country: req.body.country
    });

    // see if a city with name of the new city already exists and send an error if it does
    cityModel.find({name: newCity.name})
    .then(data => {
      if (data.length > 0) {
        console.log(data);
        res.status(409).send("A city with this name already exists.");
      
      // if no city with that name exists, add it to db
      } else {
        newCity.save()
        .then(city => {
          res.send(city)
        })
        .catch(err => {
          res.status(500).send("Server error")
        }) 
      }
    })
  }
);
