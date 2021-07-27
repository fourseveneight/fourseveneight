const mongoose = require('mongoose'); //Import mongoose
const slugify = require('slugify'); //Import slugify

const postSchema = new mongoose.Schema( //Initialize new schema
  {
    name: {
      type: String,
      required: [true, 'Post name required'],
    },
    content: {
      type: String,
      required: [true, 'Post must have content'],
    },
    date: {
      type: Date,
      required: [true, 'Post must have a date'],
      default: Date.now(),
    },
    active: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
    },
    authors: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    tags: {
      type: [String],
      required: [true, 'A post must have at least one tag!'],
    },
    length: {
      type: String,
      enum: ['short', 'medium', 'long'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: false,
    },
    images: {
      type: [String],
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

postSchema.index({ slug: 1 });

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'authors',
    select: '-__v -resetPasswordToken -resetPasswordExpires -passwordChangedAt',
  });
  next();
});

postSchema.pre('save', function (next) {
  //Before saving, create a slug
  this.slug = slugify(this.name, {
    lower: true, //make the slug lowercase
  });
  next(); //call next middleware
});

const Post = mongoose.model('Post', postSchema); //Model schema

module.exports = Post; //Export schema
