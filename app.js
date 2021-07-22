const express = require('express');

const articleRouter = require('./routes/articleRouter');

const app = express();

app.use('/api/v1/articles', articleRouter);

module.exports = app;