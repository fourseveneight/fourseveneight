const factory = require('./handlerFactory'); //require factory
const Comment = require('../models/commentModel'); //require comment model
const Post = require('../models/postModel');
const User = require('../models/userModel');
const { sanitizeBody } = require('../auth/authFunctions'); //require function to sanitize http request body
const catchAsync = require('../util/catchAsync'); //require catchAsync utility

/**
 * @internal
 * @access private
 */

exports._getAllComments = factory.getAll(Comment);
exports._deleteComment = factory.deleteOne(Comment);

/**
 * @route GET /api/v1/admin/comments/:postId
 * @description gets all comments on a post
 * @access private
 */

exports._getAllCommentsOnPost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.postId });
  if (!post) {
    res.status(404).json({
      status: 'failed',
      data: {
        message: 'could not find post!',
      },
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      comments: post.comments,
    },
  });
});

/**
 * @route /api/v1/admin/comments/:slug
 * @description deactivates all comments on a given post
 * @access private
 */

exports._deactivateAllCommentsOnPost = catchAsync(async (req, res, next) => {
  const commentsToUpdate = [];
  const post = await Post.findOne({ slug: req.params.postId });
  if (!post) {
    res.status(404).json({
      status: 'failed',
      data: {
        message: 'could not find post!',
      },
    });
  }
  const update = { active: false };
  post.comments.forEach((doc) => commentsToUpdate.push(doc._id));
  Promise.all(
    commentsToUpdate.map(async (commentId) => {
      await Comment.findByIdAndUpdate(commentId, update, {
        new: true,
        runValidators: true,
      });
    })
  );
  res.status(200).json({
    status: 'success',
    data: {
      message: 'comments deactivated!',
    },
  });
});

/**
 * @route
 * @description deletes all comments on a post permanently
 */
exports._deleteAllCommentsOnPost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.postId });
  if (!post) {
    res.status(404).json({
      status: 'failed',
      data: {
        message: 'could not find post!',
      },
    });
  }
  await post.updateOne({ slug: req.params.postId }, { $set: { comments: [] } });
  res.status(204).json({
    status: 'success',
    data: {
      post,
    },
  });
});

/**
 * @route
 * @description gets all comments that a particular user has written
 * @access private
 */

exports._getAllUserComments = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.userId });

  if (!user) {
    res.status(400).json({
      status: 'success',
      data: {
        message: `bad request. User ${user.username} does not exist!`,
      },
    });
  }

  const userComments = await Comment.find({ authors: { $in: [user._id] } });
  res.status(200).json({
    status: 'success',
    length: userComments.length,
    data: {
      userComments,
    },
  });
});

/**
 * @route
 * @description edits one comment on a post. Has SuperUser privileges in that this route can be used to change the likes and active status on a comment
 * @access private
 */

exports._editOneCommentOnPost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.postId });

  const comment = await Comment.findById(req.params.commentId);

  if (!post || !comment) {
    return res.status(400).json({
      status: 'failed',
      data: {
        message: 'invalid post and/or comment',
      },
    });
  }
  if (!(String(post._id) === String(comment.post))) {
    return res.status(400).json({
      status: 'failed',
      data: {
        message: 'invalid post and/or comment',
      },
    });
  }
  const filteredBody = sanitizeBody(req.body, 'content', 'likes', 'active');
  filteredBody.superUserModified = true;
  await Comment.findByIdAndUpdate(req.params.commentId, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

/**
 * @route
 * @description deletes one comment on a post permanently
 * @access private
 */

exports._deleteOneCommentOnPost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.postId });
  const comment = await Comment.findById(req.params.commentId);
  if (!post || !comment) {
    return res.status(400).json({
      status: 'failed',
      data: {
        message: 'invalid post and/or comment',
      },
    });
  }
  if (!(String(comment.post) === String(post._id))) {
    return res.status(400).json({
      status: 'failed',
      data: {
        message: 'invalid post and/or comment',
      },
    });
  }
  await Post.updateOne(
    { slug: req.params.postId },
    { $pull: { comments: { $in: [comment._id] } } }
  );
  res.status(204).json({
    status: 'success!',
    data: {
      comment,
    },
  });
});
