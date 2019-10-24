const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

// passport
const passport = require("passport");

// database variables
const db = require("./keys").mongoURI;
const mongoose = require("mongoose");

// middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());

// passport middleware
app.use(passport.initialize());
// passport configuration
require("./passport");

// routes
app.use("/cities", require("./routes/cities"));
app.use("/user", require("./routes/user"));

// listening
app.listen(port, () => {
  console.log("Server is running on " + port + "port");
});

// connecting to db
mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
  .then(() => console.log("Connection to Mongo DB established"))
  .catch(err => console.log(err));