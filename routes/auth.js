// Require needed packages
const express = require('express');
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')

// Get any needed environment variables
require('dotenv').config();

// Import the user model
const userModel = require('../models/user')

// Load any utils
const ROLES = require('../utils/roles');
const UTILS = require('../utils/auth');

// Signup route
router.post('/register', passport.authenticate('register', { session: false }), async ( req, res, next) => {

    res.status(201).json({
        status: 201,
        message: 'Signup successful',
        user: req.user
    })
    
});

// Login route
router.post('/login', async( req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try{
            
            if(err|| !user){
                // Check the info sent back from the passport login script
                let error;

                console.log(info)

                if(info.message == 'user not found'){
                    error = new Error('Specified user was not found');
                    error.status = 404;
                } else if (info.message == 'Wrong password'){
                    error = new Error('The specified password was incorrect');
                    error.status = 409;
                } else if (info.message == "Missing credentials") {
                    error = new Error('Missing username or password');
                    error.status = 404;
                } else {
                    error = new Error('There was an error with logging in');
                    error.status = 500;
                }
                
                return next(error);
            }

            req.login(user, {session: false}, async(error) => {
                if(error) return next(error);
                
                // Lets build up the body of the token
                const body = { 
                    _id: user.user_id, 
                    email: user.email,
                    roles: user.roles
                };

                // Generate and send back the token
                const token = await userModel.generateAccessToken({ user: body });
                return res.json({ token });
            });
        } catch(error) {
            return next(error);
        };
    })(req, res, next);
});

// Test secure route
router.get(
    '/profile', 
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Customer),
    (req,res,next) => {

    res.json({
        message: "You loaded your profile",
        user: req.user,
        token: req.query.secret_token 
    });

});

module.exports = router;