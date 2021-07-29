const factory = require('./handlerFactory'); //Import factory functions
const Post = require('../models/postModel'); //Import necessary model
const Comment = require('../models/commentModel');
const catchAsync = require('../util/catchAsync');
const { sanitizeBody } = require('../auth/authFunctions');

//CRUD functionality

/**
 * @internal
 * @access private
 */
exports._createPost = factory.createOne(Post); //? Create
exports._updatePost = factory.updateOne(Post); //? Update
exports._deletePost = factory.deleteOne(Post); //? Delete

/**
 * @client
 * @access public
 */

exports.getAllPosts = factory.getAll(Post); //? Read
exports.getPost = factory.getOne(Post); //? Read

/**
 * @route
 * @description
 * @access
 */
exports.createPost = catchAsync(async (req, res, next) => {
  const filteredBody = sanitizeBody(
    req.body,
    'name',
    'content',
    'tags',
    'length',
    'difficulty',
    'images'
  );
  filteredBody.authors = req.user._id;
  const post = await Post.create(filteredBody);
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

/**
 * @route PATCH /api/v1/posts/:slug
 * @description allows users to update the posts they've written
 * @access protected
 */

exports.updatePost = catchAsync(async (req, res, next) => {
  const filteredBody = sanitizeBody(
    req.body,
    'name',
    'content',
    'tags',
    'length',
    'difficulty',
    'images'
  );
  const post = await Post.findOneAndUpdate(
    { slug: req.params.slug },
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

/**
 * @route DELETE /api/v1/posts/:slug
 * @description Allows users to "delete" a post. This sets the post to inactive and invisible, but it will still be in the database. Only I can permanently delete posts
 * @access protected
 */

exports.deletePost = catchAsync(async (req, res, next) => {
  const update = { active: false };
  const post = await Post.findOneAndUpdate({ slug: req.params.slug }, update, {
    new: true,
    runValidators: true,
  });
  res.status(204).json({
    status: 'success',
    data: {
      message: 'Post successfully deleted!',
      post,
    },
  });
});

/**
 * @route /api/v1/posts/new
 * @description fetches all new posts
 * @access public
 */

exports.getNewPosts = catchAsync(async (req, res, next) => {
  req.query.sort = '-date'; //pre-populate query -->sort by most recent articles
  next();
});

/**
 * @v2 feature --> //TODO Implement algorithm once v1 is online
 * @description fetches recommended posts based on an algorithm
 * @access protected
 */
exports.getRecommendedPosts = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Route works',
    },
  });
};

/**
 * @route POST /api/v1/posts/:slug/comments
 * @description allows a user to add a new comment on the post
 * @access protected
 */

exports.createNewCommentOnPost = catchAsync(async (req, res, next) => {
  const filteredBody = sanitizeBody(req.body, 'content');
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post || !filteredBody) {
    res.status(400).json({
      status: 'failed',
      data: {
        message: 'bad request!',
      },
    });
  }
  filteredBody.authors = [req.user._id];
  filteredBody.post = post._id;
  const comment = await Comment.create(filteredBody);
  const commentId = comment._id;

  await Post.findOneAndUpdate(
    { slug: req.params.slug },
    { $push: { comments: commentId } },
    { new: true, runValidators: true }
  );
  res.status(200).json({
    status: 'success',
    data: {
      message: 'new comment on post successfully created!',
      comment,
    },
  });
});

/**
 * @route PATCH /api/v1/posts/:slug/comments
 * @description allows a user to edit an existing comment they wrote on the post
 * @access protected
 */

exports.editCommentOnPost = catchAsync(async (req, res, next) => {
  const user = req.user._id; //Logged in user's id
  const { commentId } = req.body; //commentId from req.body
  const filteredBody = sanitizeBody(req.body, 'content'); //Sanitize request body
  const originalComment = await Comment.findById(commentId);
  const originalCommentAuthor = originalComment.authors[0];
  if (!(String(originalCommentAuthor) === String(user))) {
    res.status(400).json({
      status: 'failed',
      data: {
        message: 'bad request!',
      },
    });
  }
  await Comment.findByIdAndUpdate(commentId, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      message: 'comment successfully updated!',
    },
  });
});

/**
 * @route DELETE /api/v1/posts/:slug/comments
 * @description allows a user to "delete" an existing comment they wrote on the post. It will still be in the database, but only I will be able to see it
 * @access protected
 */

exports.deleteCommentOnPost = catchAsync(async (req, res, next) => {
  const user = req.user._id; //User's id
  const { commentId } = req.body;
  const comment = await Comment.findById(commentId);
  if (!(String(comment.authors[0]) === String(user))) {
    return res.status(400).json({
      status: 'failed',
      data: {
        message: 'bad request!',
      },
    });
  }
  const update = { active: false };
  await Comment.findByIdAndUpdate(commentId, update, {
    new: true,
    runValidators: true,
  });
  res.status(204).json({
    status: 'success',
    data: {
      message: 'comment successfully deleted!',
    },
  });
});
