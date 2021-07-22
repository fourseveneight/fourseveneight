const express = require('express');
const articleController = require('../controllers/articleController');

const router = express.Router();

router.route('/').get(articleController.getAllArticles);

module.exports = router;