module.exports = (req, res, next) => {
  res.render("home", {
    pageTitle: "Home",
    msg: "Spaceden",
    isAuthenticated: req.session.isLoggedIn,
  });
};

//render home page
