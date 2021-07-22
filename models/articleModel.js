const mongoose = require("mongoose"); //Import mongoose
const slugify = require("slugify"); //Import slugify

const articleSchema = new mongoose.Schema( //Initialize new schema
  {
    name: {
      type: String,
      required: [true, "Article name required"],
    },
    content: {
      type: String,
      required: [true, "Article must have content"],
    },
    date: {
      type: Date,
      required: [true, "Article must have a date"],
      default: Date.now(),
    },
    author: {
      type: String,
      required: [true, "Article must have author"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

articleSchema.pre("save", function (next) {
  //Before saving, create a slug
  this.slug = slugify(this.name, {
    lower: true, //make the slug lowercase
  });
  next(); //call next middleware
});

const Article = mongoose.model("Article", articleSchema); //Model schema
module.exports = Article; //Export schema
