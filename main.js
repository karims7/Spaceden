const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const fetch = require("node-fetch");
const user = require("./middleware/user");
const login = require("./middleware/login");
const cT = require("./middleware/cT");
let MarsInsightWeather = require("mars-insight-weather-node");
require("dotenv").config();
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${process.env.API_KEY}&feedtype=json&ver=1.0`;

// import necessary files
const authRoutes = require("./routes/authentication");
const schRoutes = require("./routes/booking");
const LanderAccount = require("./models/lander");
const isAuth = require("./middleware/authenticated");
const { response } = require("express");

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

app.use(csrfProtection);
app.use(cT);
app.use(user);
app.use("/schedule", isAuth, schRoutes);
app.use(authRoutes);
app.use(login);

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

// app.get("/weather", async (req, res) => {
//   const weatherResponse = await fetch(api_url);
//   const weatherJson = await weatherResponse.json();
//   console.log(weatherJson);
// });

// const getWeather = () => {
//   fetch(API_URL)
//     .then((res) => res.json())
//     .then((data) => {
//       const { sol_keys, validity_checks, ...solData } = data;
//       const weatherVar = Object.entries(solData).map(([sol, data]) => {
//         return {
//           sol: sol,
//           maxTemp: data.AT.mx,
//           minTemp: data.AT.mn,
//           windSpeed: data.HWS.av,
//           windDirectionDegrees: data.WD.most_common.compass_degrees,
//           windDirectionCardinal: data.WD.most_common.compass_point,
//           date: new Date(data.First_UTC),
//         };
//       });
//       console.log(weatherVar);
//     });
// };

// getWeather();
