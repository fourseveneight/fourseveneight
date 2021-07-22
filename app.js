const express = require('express');

const app = express()

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
  });
  
module.exports = app;