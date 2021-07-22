const mongoose = require("mongoose"); //Import mongoose
const dotenv = require("dotenv"); //Require dotenv module

process.on("uncaughtException", (err) => {
  //On uncaught exception, exit
  process.exit(1);
});

dotenv.config({ path: `./config/config.env` }); //Configure path for environment variables

const app = require("./app"); //Import app from app.js
const currentTime = new Date(); //Set current time

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
); //Initialize DB variable by replacing the password field in the string with the environment variable DATABASE_PASSWORD

mongoose //connect DB
  .connect(DB, {
    //Options object to follow best practices
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(
      `Database connection successful as of ${currentTime.toLocaleString()}` //On save, verify connection with database with current timestamp
    );
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 8000; //Define port as the port listed in ./config/config.env or 8000
const server = app.listen(port); //Start server on port

process.on("unhandledRejection", (err) => {
  //On unhandled rejection, exit process
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
