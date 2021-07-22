const factory = require('./handlerFactory');
const Article = require('../models/articleModel');

exports.getAllArticles = factory.getAll(Article);