const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
require("dotenv").config();

// import necessary files
const authRoutes = require("./routes/auth-routes");
const schRoutes = require("./routes/schedule-routes");
const LanderAccount = require("./models/lander");
const isAuth = require("./middleware/is-auth");

// set up the server
const MONGO = process.env.MONGO || process.env.DB_CONNECTION;

const PORT = process.env.PORT || 3000;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
};

const store = new MongoDBStore({
  uri: MONGO,
  collection: "sessions",
});

const csrfProtection = csrf({});

// set up the views folder and engine
app.set("view engine", "ejs");
app.set("views", "views");

// set up the body parser for handling form data
// submitted by the user
app.use(bodyParser.urlencoded({ extended: false }));

// set up public static file
app.use(express.static(path.join(__dirname, "public")));

// set up the session
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// set up csrf protection
app.use(csrfProtection);

// server variables
app.use((req, res, next) => {
  res.locals.isAuth = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.lander) {
    return next();
  }
  LanderAccount.findById(req.session.lander._id)
    .then((lander) => {
      // make sure we actually get a user
      if (!lander) {
        return next();
      }
      req.lander = lander;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

// set up headers
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET');
//   next();
// });

// set up routes
app.use("/schedule", isAuth, schRoutes);
app.use(authRoutes);

app.get("/", (req, res, next) => {
  res.render("home", {
    pageTitle: "Home",
    msg: "Spaceden",
    isAuthenticated: req.session.isLoggedIn,
  });
});

// start the server and listen for requests
mongoose
  .connect(MONGO, options)
  .then((result) => {
    console.log(`Listening on ${PORT}`);
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });
