/** Route all /schedule req to correct controller */
// import necessary libraries
const express = require("express");

// import necessary files
const schCtrl = require("../controllers/booking");

// handle HTTP requests
const router = express.Router();

// routing for all /schedule requests

router.get("/shelter/:shelterId", schCtrl.getEditShelter);

// /schedule/shelter => GET
router.get("/shelter", schCtrl.getShelter);

// /schedule/shelter => POST
router.post("/shelter", schCtrl.postShelter);

// /schedule/add-appointment => POST
router.post("/", schCtrl.postAppointment);

// router.get("/bookings", schCtrl.getBookings);

router.get("/load/:shelterId/:date", schCtrl.getScheduleData);

router.post("/delete/:shelterId/:schId", schCtrl.deleteAppointment);

// /schedule => GET
router.get("/", schCtrl.getSchedule);

module.exports = router;
