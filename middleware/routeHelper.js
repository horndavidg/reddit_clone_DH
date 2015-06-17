var db = require("../models");

var routeHelpers = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      return next();
    }
    else {
     res.redirect('/login');
    }
  },

  ensureCorrectUser: function(req, res, next) {
    db.Country.findById(req.params.id, function(err,country){
      if (country.ownerId !== req.session.id) {
        res.redirect('/country');
      }
      else {
       return next();
      }
    });
  },

  preventLoginSignup: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      res.redirect('/country');
    }
    else {
     return next();
    }
  }
};


module.exports = routeHelpers;