const mongoose = require('mongoose'); //Import mongoose
const slugify = require('slugify'); //Import slugify

const postSchema = new mongoose.Schema( //Initialize new schema
  {
    name: {
      type: String,
      required: [true, 'Article name required'],
    },
    content: {
      type: String,
      required: [true, 'Article must have content'],
    },
    date: {
      type: Date,
      required: [true, 'Article must have a date'],
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
      required: [true, 'An article must have at least one tag!'],
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
