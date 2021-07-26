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
  const { name, email, username, password, passwordConfirm } = req.body; //Destructure body into 5 variables
  const errors = []; //Initialize errors as an empty array

  if (!name || !email || !password || !passwordConfirm || !username) {
    //If any of these things don't exist, push an error to errors
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password !== passwordConfirm) {
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
            message:
              'This email is already registered with an account. Please login or reset your password if you forgot it!',
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
                  subject: 'Account confirmation email',
                  message: `localhost:8000/api/v1/users/confirm/${newUser._id}`,
                });
                //then send a success message (just a json for now)
                res.status(200).json({
                  status: 'success',
                  data: {
                    message:
                      'account successfully registered! Please check your email for a confirmation email to activate your account.',
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

exports.confirmAccount = (req, res, next) => {
  User.findOne({ _id: req.params.id }).then((user) => {
    //Find user by /:id in querystring
    if (!user) {
      res.status(404).json({
        status: 'failure',
        data: {
          message: 'Unable to activate account!',
        },
      });
    }
    user.active = true; //Set active to true
    user.save().then(() => {
      //Save the user
      res.status(200).json({
        status: 'success',
        data: {
          message: 'Account successfully activated!',
        },
      });
    });
  });
};

exports.logout = (req, res, next) => {
  req.logout();
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Successfully logged out!',
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
            message: `The email address ${req.body.email} is not associated with any account!`,
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
            subject: 'Password reset link',
            message: `${link} is your password reset link`,
          });
          res.status(200).json({
            status: 'success',
            data: {
              message: 'Check your email for your password reset link.',
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
          message: 'Internal server error!',
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
            message:
              'Password reset token is invalid or has expired. Please request a new link and try again. If the problem persists, please contact support at support@fourseveneight.com',
          },
        });
      user.password = req.body.password;
      user.resetPasswordToken = undefined; //Set these fields to undefined
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
                subject: 'Confirm reset password',
                message:
                  'Your password was recently reset. If this was not you, please contact support immediately at support@fourseveneight.com',
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
                  message: 'Internal server error!',
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
