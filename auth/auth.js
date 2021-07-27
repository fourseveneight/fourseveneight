/*************************************************
 *
 * *Functions for verifying authentication status
 * *and restricting routes
 *
 * **********************************************/

module.exports = {
  sanitizeBody: function (req, res, next) {
    const body = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(body, 'role')) {
      res.status(403).send({
        status: 'failed',
        data: {
          message: 'current account not authorized to designate role!',
        },
      });
    }
    next();
  },
  checkStatus: function (req, res, next) {
    if (req.user.active === true) {
      return next();
    }
    return res.status(403).json({
      status: 'failed',
      data: {
        message: 'Must confirm your account to access this resource!',
      },
    });
  },
  verifyAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(403).json({
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
    return res.status(403).json({
      status: 'failed',
      data: {
        message: 'unable to authorize',
      },
    });
  },
};
