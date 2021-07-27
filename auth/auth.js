/*************************************************
 *
 * *Functions for verifying authentication status
 * *and restricting routes
 *
 * **********************************************/

module.exports = {
  /**
   * @param obj: object to be filtered
   * @param  {...any} allowed: allowed fields
   * @description: sanitizes an object
   * @returns: sanitized object
   */
  sanitizeBody: function (obj, ...allowed) {
    const sanitizedObject = {};
    Object.keys(obj).forEach((el) => {
      if (allowed.includes(el)) {
        sanitizedObject[el] = obj[el];
      }
    });
    return sanitizedObject;
  },
  /**
   * @params request object, response object, next
   * @description: checks user's active status
   * @returns next function in the middleware stack if req.user.active is true
   */
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
  /**
   * @description Use to restrict certain routes to logged in users only
   * @returns next() if the user is logged in.
   */
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
  /**
   * @description Restricts certain routes by current user's role
   * @returns next() if the user's role is admin or root
   */
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
