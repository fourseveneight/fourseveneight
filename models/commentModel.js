const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment must have content!'],
      maxlength: 600,
    },
    timestamp: {
      type: Date,
      default: Date.now(),
    },
    likes: {
      type: Number,
      default: 0,
    },
    authors: [
      {
        type: mongoose.Schema.ObjectId, //Only one user can leave a specific comment
        ref: 'User',
        required: [true, 'A comment must have an author!'],
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    post: {
      type: mongoose.Schema.ObjectId, //A comment can only belong to one post
      ref: 'Post',
      required: [true, 'A comment must have an associated post!'],
    },
    superUserModified: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
