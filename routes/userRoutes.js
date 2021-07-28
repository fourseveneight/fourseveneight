/**
 * *User router
 * @author root
 * @description defines all user routes
 * @datestarted July 24, 2021
 * @datecompleted (v1) July 28, 2021
 * *As of July 28, 2021, all routes below have been tested and confirmed to work
 */
const express = require('express'); //require express
const userController = require('../controllers/userController'); //import controllers
const {
  //Auth functions to place on the middleware stack before protected resources
  verifyAuthenticated,
  restrictTo,
  checkStatus,
} = require('../auth/auth');

const router = express.Router(); //initialize router

router
  .route('/') //* ✓
  .get(verifyAuthenticated, restrictTo('root'), userController.getAllUsers);

router
  .route('/login') //on /login //* ✓
  .get(userController.showLoginPage)
  .post(userController.login); //login function

router
  .route('/register') //* ✓
  .get(userController.showRegisterPage)
  .post(userController.register);

router
  .route('/dashboard') //* ✓
  .get(verifyAuthenticated, checkStatus, userController.showDashboard);

router.get('/logout', userController.logout); //* ✓
router.route('/recover').post(userController.recover); //* ✓
router.route('/reset/:token').post(userController.resetPassword); //* ✓
router.route('/confirm/:id').get(userController.confirmAccount); //* ✓

module.exports = router;
