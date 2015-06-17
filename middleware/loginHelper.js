var db = require("../models");

var loginHelpers = function (req, res, next) {

  req.login = function (user) {
    req.session.id = user._id;
  };

  req.logout = function () {
    req.session.id = null;
    
    // req.user  = null;
    // Always clear the session id when a user logs out otherwise
    // they will be able to log in without loging in...
  };

  next();
};

module.exports = loginHelpers;