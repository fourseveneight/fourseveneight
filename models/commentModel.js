const mongoose = require('mongoose');
const slugify = require('slugify');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment must have content!'],
    },
    timestamp: {
      type: Date,
      default: Date.now(),
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
