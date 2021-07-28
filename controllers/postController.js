const factory = require('./handlerFactory'); //Import factory functions
const Post = require('../models/postModel'); //Import necessary model
const catchAsync = require('../util/catchAsync');

//CRUD functionality

exports.createPost = factory.createOne(Post); //? Create
exports.getAllPosts = factory.getAll(Post); //? Read
exports.getPost = factory.getOne(Post); //? Read
exports.updatePost = factory.updateOne(Post); //? Update
exports.deletePost = factory.deleteOne(Post); //? Delete

exports.getNewPosts = catchAsync(async (req, res, next) => {
  req.query.sort = '-date'; //pre-populate query -->sort by most recent articles
  next();
});

exports.getRecommendedPosts = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Route works',
    },
  });
};
