const LanderAccount = require("../models/lander");
module.exports = (req, res, next) => {
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
};
