const express = require('express'); //require express
const userController = require('../controllers/userController'); //import controllers

const router = express.Router(); //initialize router

router
  .route('/login') //on /login
  .get((req, res) => {
    res.status(200).json({
      //just send this JSON for now
      status: 'success',
      data: {
        message: 'route works',
      },
    });
  })
  .post(userController.login); //login function

router
  .route('/register')
  .get((req, res) => {
    res.status(200).json({
      status: 'success',
      data: {
        message: 'route also works',
      },
    });
  })
  .post(userController.register);

router.get('/logout', userController.logout);

router.route('/forgot-password').post(userController.forgotPassword);

router
  .route('/change-password/:timestamp/:hash/:id')
  .post(userController.changePassword);

module.exports = router;
