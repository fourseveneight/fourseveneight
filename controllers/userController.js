const passport = require('passport'); //get passport
const bcrypt = require('bcryptjs');
const factory = require('./handlerFactory'); //import factory
const User = require('../models/userModel'); //import user model
const sendEmail = require('../util/email'); //Import email send utility
const { createResetToken } = require('../auth/auth'); //Import createResetToken from auth

//TODO: Protect these routes
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

//*This route needs to be modified once a proper frontend is built.
exports.login = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/success',
    failureRedirect: '/failure',
  })(req, res, next);
};

exports.register = (req, res) => {
  //registration function
  const { name, email, username, password, password2 } = req.body; //Destructure body into 5 variables
  const errors = []; //Initialize errors as an empty array

  if (!name || !email || !password || !password2 || !username) {
    //If any of these things don't exist, push an error to errors
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password !== password2) {
    //If the passwords don't match, push an error
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    //If the password's length is less than 6, add an error
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    //If the length of the errors array is greater than zero (meaning we have an error), send a json with a failure message
    res.status(400).json({
      status: 'failed',
      data: {
        message: 'registration failed!',
      },
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      //Otherwise, attempt to find the user by email
      if (user) {
        errors.push({ msg: 'Email already exists' }); //If the user already exists, we won't allow registration, so send a 400 bad request
        res.status(400).json({
          status: 'failed',
          data: {
            message: 'bad request!',
          },
        });
      } else {
        const newUser = new User({
          //Otherwise create a new user with all this jank
          name,
          email,
          password,
          username,
        });

        bcrypt.genSalt(10, (err, salt) => {
          //Generate a salt
          // eslint-disable-next-line no-shadow
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            //Then a hash. Our password is now successfully hashed
            if (err) throw err;
            newUser.password = undefined; //set it to undefined first, for extra security
            newUser.password = hash; //then set it to the new salted and hashed password
            newUser
              .save() //Save the user in the database
              .then(() => {
                //then send a success message (just a json for now)
                res.status(200).json({
                  status: 'success',
                  data: {
                    message: 'new user successfully registered!',
                  },
                });
              })
              .catch(() => {
                //if any error happened after all that jank, send a 500 internal server error
                res.status(500).json({
                  status: 'failed',
                  data: {
                    message: 'internal server error!',
                  },
                });
              });
          });
        });
      }
    });
  }
};

exports.logout = (req, res, next) => {
  req.logout();
  res.status(200).json({
    status: 'success',
    data: {
      message: 'successfully logged out',
    },
  });
};

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    //If there is no user, return an error
    res.status(404).json({
      status: 'failed',
      data: {
        message: 'No user with that email found',
      },
    });
  }
  const token = createResetToken(); //Create a token with two of the necessary parts
  token.push(user.id); //Add the third part
  sendEmail({
    email: req.body.email, //Send email to the email passed into the body
    subject: 'Password change link',
    message: `localhost:8000/api/v1/users/change-password/${token[0]}/${token[1]}/${token[2]} is your password reset link`,
  });
  res.status(200).json({
    status: 'success',
    data: {
      message: 'successfully sent email with reset token!',
    },
  });
};

exports.changePassword = (req, res, next) => {
  const { password, passwordConfirm } = req.body; //split req.body into two variables
  const errors = [];
  //Do password validation
  if (password !== passwordConfirm) {
    errors.push({ msg: 'passwords do not match!' });
  }
  if (password.length < 8) {
    errors.push({ msg: 'new password length cannot be below 8 characters!' });
  }
  if (errors.length > 0) {
    res.status(400).json({
      status: 'failed',
      data: {
        errors,
      },
    });
  }
  User.findById({ _id: req.params.id }).then((user) => {
    //Find the user by the ObjectId in req.params (3rd part of the token)
    if (!user) {
      //If this is unsuccessful:
      res.status(400).json({
        status: 'failed',
        data: {
          message: 'malformed reset token!',
        },
      });
    }
    //Otherwise, generate a salted and hashed password, and replace the user's password with this
    bcrypt.genSalt(10, (err, salt) => {
      //Generate a salt
      // eslint-disable-next-line no-shadow
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        //Then a hash. Our password is now successfully salted and hashed
        if (err) throw err;
        user.password = undefined; //set it to undefined first, for extra security
        user.password = hash; //then set it to the new salted and hashed password
        user
          .save() //Save the user in the database
          .then(() => {
            //then send a success message (just a json for now)
            res.status(200).json({
              status: 'success',
              data: {
                message: 'password successfully changed!',
              },
            });
          })
          .catch(() => {
            //if any error happened after all that jank, send a 500 internal server error
            res.status(500).json({
              status: 'failed',
              data: {
                message: 'internal server error!',
              },
            });
          });
      });
    });
  });
};
