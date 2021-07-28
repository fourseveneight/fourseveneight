const express = require('express');
const postController = require('../controllers/postController');
const { getHotPosts } = require('../tools/algorithms');
const {
  verifyAuthenticated,
  checkStatus,
  verifyUserOriginalAuthor,
} = require('../auth/auth');

const router = express.Router();

router
  .route('/')
  .get(postController.getAllPosts) //Don't need an account to view all posts
  .post(verifyAuthenticated, checkStatus, postController.createPost); //You do need an active account and to be logged in to create a post

router.route('/hot').get(verifyAuthenticated, checkStatus, getHotPosts); //You need to be authenticated and active to get hot posts, since they are based on a user's tags
router
  .route('/new')
  .get(postController.getNewPosts, postController.getAllPosts); //Get all new posts. You don't have to be logged in for this
router.route('/recommended').get(postController.getRecommendedPosts);

router
  .route('/:slug')
  .get(postController.getPost)
  .patch(
    verifyAuthenticated,
    verifyUserOriginalAuthor,
    postController.updatePost
  )
  .delete(
    verifyAuthenticated,
    verifyUserOriginalAuthor,
    postController.deletePost
  ); //You don't need an account to view a post, but you needed to be logged in as user who originally created the post (or root) to edit or delete it

module.exports = router;
