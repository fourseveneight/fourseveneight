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

router.route('/recover').post(userController.recover);

router.route('/reset/:token').post(userController.resetPassword);

module.exports = router;
