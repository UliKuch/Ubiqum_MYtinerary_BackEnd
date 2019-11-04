const express = require("express");
const router = express.Router();

const cityModel = require("../model/cityModel");
const itineraryModel = require("../model/itineraryModel");
const activityModel = require("../model/activityModel");
const userModel = require("../model/userModel");

const passport = require("passport");


// ********** routes **********


// -------------------- GET test route --------------------
module.exports = router.get("/test", (req, res) => {
  return res.send({ msg: "Cities test route." })
})


// -------------------- GET all cities --------------------
module.exports = router.get("/all",
  (req, res) => {
    cityModel.find({})
      .then(files => {
        return res.send(files)
      })
      .catch(err => console.log(err));
  }
);


// -------------------- GET specific city --------------------
module.exports = router.get("/:name",
	(req, res) => {
      let cityRequested = req.params.name;
      cityModel.findOne({ name: cityRequested })
			.then(city => {
        return res.send(city)
      })
			.catch(err => console.log(err));
});


// ---------- GET itineraries for specific city ----------
module.exports = router.get("/:name/itineraries",
	(req, res) => {
    const cityRequested = req.params.name;
    cityModel.findOne({ name: cityRequested })
    .then(city => {
      itineraryModel.find({ city: city.name })
      .then(itineraries => {
        return res.send(itineraries)
      })
      .catch(err => console.log(err))
    })
    .catch(err => console.log(err));
});


// ---------- GET activities for specific itinerary ----------
module.exports = router.get("/:name/itineraries/:itinerary",
  (req, res) => {
    const cityRequested = req.params.name;
    const itinRequested = req.params.itinerary;
    // no checks whether city and itinerary are in database necessary
    activityModel.find({ city: cityRequested, itinerary: itinRequested })
      .then(activities => {
        return res.send(activities)
      })
      .catch(err => console.log(err))
})


// -------------------- POST new city --------------------
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
        return res.status(409).send("A city with this name already exists.");
      
      // if no city with that name exists, add it to db
      } else {
        newCity.save()
        .then(city => {
          return res.send(city)
        })
        .catch(err => {
          return res.status(500).send("Server error")
        }) 
      }
    })
  }
);


// --------------- GET comments for itinerary ---------------
module.exports = router.get("/:name/itineraries/:itinerary/comments",
  // comments are visible for all users, logged in or not
  (req, res) => {
    const cityRequested = req.params.name;
    const itinRequested = req.params.itinerary;
    itineraryModel.findOne({
      title: itinRequested,
      city: cityRequested
    })
      .then(itin => {
        return res.status(200).send(itin.comments);
      })
      .catch(err => res.status(500).send("An error occured."))
  }
)


// -------------------- POST new comment --------------------
// called with token in header and commentBody in body
module.exports = router.post("/:name/itineraries/:itinerary/comment",
  passport.authenticate("jwt", { session: false}),
  async (req, res) => {
    const cityRequested = req.params.name;
    const itinRequested = req.params.itinerary;

    try {
      const user = await userModel.findById(req.user.id);

      // check if user is logged-in db-side
      if (!user.isLoggedIn) {
        return res.status(403).json("You have to be logged in to comment.")
      };

      // find itinerary in db
      const itinerary = await itineraryModel.findOne({
        title: itinRequested,
        city: cityRequested
      })

      // create new comment from req and user data
      const newComment = {
        body: req.body.commentBody,
        authorId: user._id,
        authorUsername: user.username,
        authorEmail: user.email,
        date: Date.now()
      }

      // push new comment to db
      await itinerary.comments.push(newComment);
      await itinerary.save();

      return res.status(200).json("Comment has been added.")
    }
    catch (error) {
      console.log(error);
      return res.status(500).json("An error occured.")
    }
  }
)


// -------------------- PUT update comment --------------------
// called with token in header and commentBody + commentId in body
module.exports = router.put("/:name/itineraries/:itinerary/comment",
  passport.authenticate("jwt", { session: false}),
  async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id);

      // check if user is logged-in db-side
      if (!user.isLoggedIn) {
        return res.status(403).json("You have to be logged in to comment.");
      };

      // find itinerary and comment to update
      const itinerary = await itineraryModel
          .findOne({"comments._id": req.body.commentId})
      const commentToUpdate = itinerary.comments.filter(comment => {
        return comment._id.toString() === req.body.commentId
      })[0]

      // check if comment was posted by user sending the request
      if (user._id != commentToUpdate.authorId) {
        return res.status(401).json("You can only edit your own comments.");
      }

      // update and save comment
      commentToUpdate.body = req.body.commentBody;
      commentToUpdate.lastUpdateAt = Date.now();
      await itinerary.save();

      return res.status(200).json("Comment has been updated.")
    }
    catch (error) {
      console.log(error);
      return res.status(500).json("An error occured.")
    }
  }
)

