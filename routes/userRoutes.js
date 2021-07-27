const express = require('express'); //require express
const userController = require('../controllers/userController'); //import controllers

const router = express.Router(); //initialize router

router.route('/').get(userController.getAllUsers);

router
  .route('/login') //on /login
  .get(userController.showLoginPage)
  .post(userController.login); //login function

router
  .route('/register')
  .get(userController.showRegisterPage)
  .post(userController.register);

router.get('/logout', userController.logout);
router.route('/recover').post(userController.recover);
router.route('/reset/:token').post(userController.resetPassword);
router.route('/confirm/:id').get(userController.confirmAccount);

module.exports = router;
