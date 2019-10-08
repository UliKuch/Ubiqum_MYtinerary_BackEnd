const express = require("express");
const router = express.Router();

const cityModel = require("../model/cityModel")

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
