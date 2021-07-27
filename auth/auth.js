/*************************************************
 *
 * *Functions for verifying authentication status
 * *and restricting routes
 *
 * **********************************************/

module.exports = {
  sanitizeBody: function (obj, ...allowed) {
    const sanitizedObject = {};
    Object.keys(obj).forEach((el) => {
      if (allowed.includes(el)) {
        sanitizedObject[el] = obj[el];
      }
    });
    return sanitizedObject;
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
