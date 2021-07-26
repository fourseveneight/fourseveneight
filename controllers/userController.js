/* eslint-disable no-shadow */
const passport = require('passport'); //get passport
const bcrypt = require('bcryptjs');
const factory = require('./handlerFactory'); //import factory
const User = require('../models/userModel'); //import user model
const sendEmail = require('../util/email'); //Import email send utility

//TODO: Protect these routes
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.showLoginPage = (req, res) => {
  res.status(200).json({
    //just send this JSON for now
    status: 'success',
    data: {
      message: 'route works',
    },
  });
};

exports.showRegisterPage = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'route also works',
    },
  });
};

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
                sendEmail({
                  email: newUser.email,
                  subject: 'Account confirmation',
                  message: `localhost:8000/api/v1/users/confirm/`,
                });
                //then send a success message (just a json for now)
                res.status(200).json({
                  status: 'success',
                  data: {
                    message:
                      'account successfully registered!\nPlease check your email for a confirmation email to activate your account.',
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

exports.recover = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user)
        return res.status(401).json({
          status: 'failed',
          data: {
            message:
              'The email address entered is not associated with any account!',
          },
        });
      user.generatePasswordResetToken();
      // eslint-disable-next-line no-shadow
      user
        .save()
        .then((user) => {
          const link = `localhost:8000/api/v1/users/reset/${user.resetPasswordToken}`;
          sendEmail({
            email: req.body.email, //Send email to the email passed into the body
            subject: 'Password change link',
            message: `localhost:8000/api/v1/users/change-password/${link} is your password reset link`,
          });
          res.status(200).json({
            status: 'success',
            data: {
              message: 'Check your email for your password reset link',
            },
          });
        })
        .catch(() => {
          res.status(500).json({
            status: 'failed',
            data: {
              message: 'Internal server error!',
            },
          });
        });
    })
    .catch(() => {
      res.status(500).json({
        status: 'failed',
        data: {
          message: 'Internal server error',
        },
      });
    });
};

exports.resetPassword = (req, res, next) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user)
        return res.status(401).json({
          status: 'failed',
          data: {
            message: 'Password reset token is invalid or has expired!',
          },
        });
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      bcrypt.genSalt(10, (err, salt) => {
        //Generate a salt
        // eslint-disable-next-line no-shadow
        bcrypt.hash(user.password, salt, (err, hash) => {
          //Then a hash. Our password is now successfully hashed
          if (err) throw err;
          user.password = hash; //then set it to the new salted and hashed password

          user
            .save() //Save the user in the database
            .then(() => {
              sendEmail({
                email: user.email,
                subject: 'Confirming reset password',
                message: 'Your password was successfully reset!',
              });
              //then send a success message (just a json for now)
              res.status(200).json({
                status: 'success',
                data: {
                  message: 'Password successfully reset!',
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
    })
    .catch(() => {
      res.status(500).json({
        status: 'failed',
        data: {
          message: 'Internal server error!',
        },
      });
    });
};
