/********************************************************
 *
 * *Server setup.
 *
 * *****************************************************/

const dotenv = require('dotenv'); //Require dotenv module

dotenv.config({ path: `./config/config.env` }); //Configure path for environment variables
const express = require('express'); //Import express
const mongoose = require('mongoose'); //Import mongoose

const session = require('express-session'); //import session
const passport = require('passport'); //import passport
require('./auth/passportConfig')(passport); //require file

const app = express(); //Initialize application

const port = process.env.PORT || 8000; //Define port as the port listed in ./config/config.env or 8000

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
); //Initialize DB variable by replacing the password field in the string with the environment variable DATABASE_PASSWORD

app.use(express.json()); //Use express.json() to parse request body
app.use(express.urlencoded({ extended: false })); //set extended to false to avoid deprecation warnings
app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`, // use session secret in config.env
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize()); //use these two middleware functions from passport
app.use(passport.session());

process.on('uncaughtException', () => {
  //On uncaught exception, exit
  process.exit(1);
});

const currentTime = new Date(); //Set current time

mongoose //connect DB
  .connect(DB, {
    //Options object to follow best practices
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(
      `Database connection successful as of ${currentTime.toLocaleString()}` //On save, verify connection with database with current timestamp
    );
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });
const articleRouter = require('./routes/postRoutes'); //require article router for /api/v1/articles routes
const userRouter = require('./routes/userRoutes');

app.use('/api/v1/posts', articleRouter); //Use articleRouter on /api/v1/articles calls
app.use('/api/v1/users', userRouter);

const server = app.listen(port); //Start server on port

process.on('unhandledRejection', (err) => {
  //On unhandled rejection, exit process
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
