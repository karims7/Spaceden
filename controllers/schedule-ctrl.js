/** Handling routes to /schedule */
// import necessary libraries

// import necessary files
const LanderAccount = require("../models/lander");
const Shelter = require("../models/shelter");
const Schedule = require("../models/schedule");

// /schedule => GET
exports.getSchedule = (req, res, next) => {
  // get all shelters for this lander
  Shelter.find({ landerId: req.lander._id })
    .then((shelters) => {
      // send all of the shelters to the template
      res.render("schedule/schedule", {
        pageTitle: "Schedule",
        landerName: req.lander.name,
        isAuthenticated: req.session.isLoggedIn,
        shelters: shelters,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// //schedule/shelter => GET
exports.getShelter = (req, res, next) => {
  // if we are editing an existing shelter, we will
  // need to search the db for the info.
  let editing = false;

  // autofill form data if we are in edit mode
  if (editing) {
    res.render("schedule/shelter", {
      editing: false,
      shelter: null,
      isAuthenticated: req.session.isLoggedIn,
    });
    // leave form empty if we are not in edit mode
  } else {
    res.render("schedule/shelter", {
      editing: false,
      shelter: null,
      isAuthenticated: req.session.isLoggedIn,
    });
  }
};

// /schedule/shelter => POST
// adding or editing a shelter
exports.postShelter = (req, res, next) => {
  // get form data
  const regionName = req.body.regionName;
  const depotType = req.body.depotType;
  const phone = req.body.phone;
  const position = req.body.position;
  const available = {
    sun: req.body.Sunday,
    mon: req.body.Monday,
    tue: req.body.Tuesday,
    wed: req.body.Wednesday,
    thu: req.body.Thursday,
    fri: req.body.Friday,
    sat: req.body.Saturday,
  };
  const landerId = req.lander._id;

  for (var key of Object.keys(available)) {
    if (available[key] === undefined) {
      available[key] = false;
    }
  }

  // add the new shelter to the database
  const newShelter = new Shelter({
    regionName: regionName,
    depotType: depotType,
    phone: phone,
    availability: {
      days: {
        sun: available.sun,
        mon: available.mon,
        tue: available.tue,
        wed: available.wed,
        thu: available.thu,
        fri: available.fri,
        sat: available.sat,
      },
    },
    position: position,
    landerId: landerId,
  });

  newShelter.save();

  // create a new schedule to go with the shelter
  const newSchedule = new Schedule({
    schedule: { appointments: [] },
    shelterId: newShelter._id,
  });

  newSchedule.save();

  res.redirect("/schedule");
};

// /schedule/add-appointment => POST
exports.postAppointment = (req, res, next) => {
  // get the appointment data from the body

  // format a date object
  const day = req.body.day;
  const time = req.body.start;
  const dateTime = new Date();

  dateTime.setFullYear(day.split("-")[0]);
  dateTime.setMonth(day.split("-")[1] - 1);
  dateTime.setDate(day.split("-")[2]);

  dateTime.setHours(time.split(":")[0]);
  dateTime.setMinutes(time.split(":")[1]);

  // get the remaining form data
  const appointment = {
    dayTime: dateTime,
    duration: req.body.duration,
    name: req.body.name,
    reason: req.body.reason,
    phone: req.body.phone,
  };

  // get the schedule model and save the appointment to the list of appointments
  Schedule.findOne({ shelterId: req.body.shelter })
    .then((schedule) => {
      if (!schedule) {
        console.log("No matching schedule found");
        return;
      }
      return schedule.addAppointment(appointment);
    })
    .catch((err) => {
      console.log(err);
    });

  res.redirect("/schedule");
};

// Respond with JSON object containing schedule for the day.
exports.getScheduleData = (req, res, next) => {
  const shelterId = req.params.shelterId;
  const newDate = new Date(req.params.date);
  const dateString = newDate.toLocaleDateString();

  Schedule.findOne({ shelterId: shelterId })
    .then((sch) => {
      // if no schedule was found
      if (!sch) {
        console.log("No schedule found");
        return;
      }

      // use the filter method to sort through the appointments
      const filteredApnt = sch.schedule.appointments.filter(
        (apt) => apt.dayTime.toLocaleDateString() === dateString
      );

      res
        .status(200)
        .json({ appointments: filteredApnt, shelterId: sch.shelterId });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditShelter = (req, res, next) => {
  // same as book shelter but fill the input
  // elements with the existing values
  const editing = req.query.edit;

  // if we are not in edit mode, redirect to /schedule
  if (!editing) {
    console.log("editing = false");
    return res.redirect("/schedule");
  }

  const shelterId = req.params.shelterId;

  // find the shelter in the db
  Shelter.findById(shelterId)
    .then((shelter) => {
      // if the shelter was not found
      if (!shelter) {
        console.log("No shelter found");
        return res.redirect("/schedule");
      }

      // if the shelter was found render the view with the old
      // shelter data
      res.render("schedule/shelter", {
        editing: editing,
        shelter: shelter,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditShelter = (req, res, next) => {};

exports.deleteAppointment = (req, res, next) => {
  // get parameters
  const shelterId = req.params.shelterId;
  const schId = req.params.schId;

  Schedule.findOne({ shelterId: shelterId })
    .then((schedule) => {
      // if no schedule was found...
      if (!schedule) {
        console.log("no schedule found.");
        return res.redirect("/schedule");
      }
      return schedule.removeAppointment(schId);
    })
    .then((result) => {
      res.redirect("/schedule");
    })
    .catch((err) => {
      console.log(err);

      res.redirect("/schedule");
    });
};
