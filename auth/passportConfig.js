const LocalStrategy = require('passport-local').Strategy; //use local strategy
const bcrypt = require('bcryptjs'); //import encryption library

// Load User model
const User = require('../models/userModel');

module.exports = function (passport) {
  //this function is what's going to be exported
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      //use local strategy with the username field as the user email
      // Match user
      User.findOne({
        //find user by email
        email: email,
      }).then((user) => {
        if (!user) {
          //if there's no email, send this message
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          //match passwords with bcrypt
          if (err) throw err; //throw err if one exists
          if (isMatch) {
            //if match, return null for the error and user
            return done(null, user);
          }
          return done(null, false, { message: 'Password incorrect' }); //otherwise return null, nothing, and a message
        });
      });
    })
  );

  passport.serializeUser((user, done) => {
    //serialize user
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    //deserialize user
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
