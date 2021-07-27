const factory = require('./handlerFactory'); //Import factory functions
const Post = require('../models/postModel'); //Import necessary model

//CRUD functionality

exports.createPost = factory.createOne(Post); //? Create
exports.getAllPosts = factory.getAll(Post); //? Read
exports.getPost = factory.getOne(Post); //? Read
exports.updatePost = factory.updateOne(Post); //? Update
exports.deletePost = factory.deleteOne(Post); //? Delete
