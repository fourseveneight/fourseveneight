const express = require("express"); //Import express
const articleController = require("../controllers/articleController"); //Import necessary controllers

const router = express.Router(); //Initialize express router

router
  .route("/") //Route on /api/v1/articles/
  .get(articleController.getAllArticles) //get all articles
  .post(articleController.createArticle); //create new article

router
  .route("/:slug") //Make slug a query parameter
  .get(articleController.getArticle) //get article
  .patch(articleController.updateArticle) //update article
  .delete(articleController.deleteArticle); //delete article

module.exports = router; //export router for use in app.js
