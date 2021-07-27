const express = require('express'); //Import express
const postController = require('../controllers/postController'); //Import necessary controllers
// const { verifyAuthenticated, restrictTo } = require('../auth/auth');

const router = express.Router(); //Initialize express router

router
  .route('/') //Route on /api/v1/posts/
  .get(postController.getAllPosts) //get all posts
  .post(postController.createPost); //create new post

router
  .route('/:slug') //Make slug a query parameter
  .get(postController.getPost) //get post
  .patch(postController.updatePost) //update post
  .delete(postController.deletePost); //delete post

module.exports = router; //export router for use in app.js
