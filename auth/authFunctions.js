/*************************************************
 *
 * *Functions for verifying authentication status
 * *and restricting routes
 *
 * **********************************************/

const User = require('../models/userModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const factory = require('../controllers/handlerFactory');

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
  restrictTo: function (...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'failed',
          data: {
            message: 'Current account not authorized for this action!',
          },
        });
      }
      next();
    };
  },
  /**
   * @description Used in the route PATCH /api/v1/posts/:slug to update a post. Verifies if the user attempting to make the edit is the same use that created the post
   * @returns next() if successful, error message if not
   */
  verifyUserOriginalAuthorOfPost: factory.verifyUserOriginalAuthor(User, Post),
  /**
   * @description Used in the route PATCH /api/v1/comments/:id to update a comment. Verifies if the user attempting to make the edit is the same use that created the comment
   * @returns next() if successful, error message if not
   */
  verifyUserOriginalAuthorOfComment: factory.verifyUserOriginalAuthor(
    User,
    Comment
  ),
};
