const factory = require("./handlerFactory"); //Import factory functions
const Article = require("../models/articleModel"); //Import necessary model

//CRUD functionality

exports.createArticle = factory.createOne(Article); //? Create
exports.getAllArticles = factory.getAll(Article); //? Read
exports.getArticle = factory.getOne(Article); //? Read
exports.updateArticle = factory.updateOne(Article); //? Update
exports.deleteArticle = factory.deleteOne(Article); //? Delete
