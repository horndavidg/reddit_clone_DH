var bcrypt = require("bcrypt");
// brings in bcrypt
var SALT_WORK_FACTOR = 10;
// constant (all caps) set to default, # of rounds that we will pass in.
var mongoose = require("mongoose");


// standard schema
var userSchema = new mongoose.Schema({
    email: {
      type: String,
      lowercase: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
  });


// hook that runs before the user saves
userSchema.pre('save', function(next) {
  var user = this;
  // refers to the instance of the user

  if (!user.isModified('password')) {
    return next();
  }
// if password hasn't been modified move on and save user


  return bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }
    return bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }
      
// final step - user.password refers to whatever was passed through via a form.
      user.password = hash;
      return next();
    });
  });
});



// don't want to call this first param "user"! We have another user defined!

// statics === CLASS METHODS

userSchema.statics.authenticate = function (formData, callback) {
  this.findOne({ // this = db.user
      // find an existing user with their e-mail.
      email: formData.email
    },
    // helper function
    function (err, user) {
      if (user === null){
        callback("Invalid username or password",null);
        // dosen't give away too much information
      }
      else {
        user.checkPassword(formData.password, callback);
      }

    });
};

// in my app.js, when a user tries to log in submitting 
// the "login" form...this will happen:
// db.User.authenticate(req.body.user, function(err, user){

//});


// INSTANCE METHOD //

userSchema.methods.checkPassword = function(password, callback) {
  var user = this;
  // this refers to the instance of the user
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (isMatch) {
      callback(null, user);
    } else {
      callback(err, null);
    }
  });
};

var User = mongoose.model("User", userSchema);

module.exports = User;