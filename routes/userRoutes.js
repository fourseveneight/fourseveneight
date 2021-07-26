const express = require('express'); //require express
const userController = require('../controllers/userController'); //import controllers
const { sanitizeBody } = require('../auth/auth');

const router = express.Router(); //initialize router

router
  .route('/login') //on /login
  .get(userController.showLoginPage)
  .post(userController.login); //login function

router
  .route('/register')
  .get(userController.showRegisterPage)
  .post(sanitizeBody, userController.register);

router.get('/logout', userController.logout);

router.route('/forgot-password').post(userController.forgotPassword);

router
  .route('/change-password/:timestamp/:hash/:id')
  .post(userController.changePassword);

router
  .route('/confirm/:timestamp/:hash/:id')
  .get(userController.confirmAccount);

module.exports = router;
