/*************************************************
 *
 * *Functions for verifying authentication status
 * *and restricting routes
 *
 * **********************************************/
const crypto = require('crypto');

module.exports = {
  verifyAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(403).json({
      status: 'failed',
      data: {
        message: 'unable to authorize',
      },
    });
  },
  restrictTo: function (req, res, next) {
    if (req.user.role === 'admin' || req.user.role === 'root') {
      return next();
    }
    res.status(403).json({
      status: 'failed',
      data: {
        message: 'unable to authorize',
      },
    });
  },
  //Function to create password reset token
  createResetToken: function () {
    const token = [];
    const timestamp = Date.now();
    const hash = crypto.randomBytes(20).toString('hex'); //random id
    token.push(timestamp);
    token.push(hash);
    return token;
  },
};
