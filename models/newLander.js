/**
 * Contains a schema for the lander accounts
 */

// import necessary libraries
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const landerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  landerId: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  }
  //   tokens for reseting passwords
  resetToken: String,
  resetTokenExpire: Date,
});

module.exports = mongoose.model("lander", landerSchema);