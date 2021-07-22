const express = require("express"); //Import express

const articleRouter = require("./routes/articleRouter"); //require article router for /api/v1/articles routes

const app = express(); //Initialize application
app.use(express.json()); //Use express.json() to parse request body

app.use("/api/v1/articles", articleRouter); //Use articleRouter on /api/v1/articles calls

module.exports = app; //Export app for use in server.js
