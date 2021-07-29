const express = require('express');
const adminController = require('../controllers/adminController');
const {
  verifyAuthenticated,
  checkStatus,
  restrictTo,
} = require('../auth/authFunctions');

const router = express.Router();

router.use(verifyAuthenticated, checkStatus, restrictTo('root'));

router.route('/comments').get(adminController._getAllComments); //* ✓

router
  .route('/comments/:postId') //* ✓
  .get(adminController._getAllCommentsOnPost)
  .patch(adminController._deactivateAllCommentsOnPost)
  .delete(adminController._deleteAllCommentsOnPost);

router.route('/comments/user/:userId').get(adminController._getAllUserComments); //* ✓

router
  .route('/comments/:postId/:commentId')
  .patch(adminController._editOneCommentOnPost)
  .delete(adminController._deleteOneCommentOnPost);

module.exports = router;
