const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const { isLoggedIn } = require('../middleware');
const users = require('../controllers/users');



router.route('/register')
    .get(users.renderRegister)                                               // render register page
    .post(catchAsync(users.register))                                        // this is just registering a new user but not logging them in


router.route('/login')                                                      
    .get(users.renderLogin)                                                 // serve a login for 
    .post(                                                                  // logging in the user
        passport.authenticate('local', 
        {failureFlash: true, failureRedirect: '/login', 
        keepSessionInfo: true}), 
        users.login)


//logout route
router.get('/logout', users.logout);

module.exports = router;