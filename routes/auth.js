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

/**
 * @swagger
 * definitions:
 *   authToken:
 *     type: object
 *     properties:
 *       _id:
 *         type: integer
 *       email:
 *         type: string
 *       roles:
 *         type: string
 *       token_secret:
 *         type: string
 *       expiresIn:
 *         type: string
 */

/**
 * @swagger
 * /auth/register
 *   post:
 *     tags:
 *       - authentication
 *       - user
 *     description: Register a new user 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: Email address of the user being registered
 *         type: string
 *         in: body
 *         required: true
 *       - name: password
 *         description: Password the user chose to be registered with
 *         type: string
 *         in: body
 *         required: true
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email address was already registered
 */
router.post('/register', passport.authenticate('register', { session: false }), async ( req, res, next) => {

    res.status(201).json({
        status: 201,
        message: 'Signup successful',
        user: req.user
    })
    
});

/**
 * @swagger
 * /auth/login
 *   post:
 *     tags:
 *       - authentication
 *       - user
 *     description: Logs in a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: Email address of the user
 *         type: string
 *         in: body
 *         required: true
 *       - name: password
 *         description: Password for the user
 *         type: string
 *         in: body
 *         required: true
 *      reponses:
 *        200:
 *          description: Login was successful and returns authentication token
 *          schema:
 *           $ref: '#/definitions/authToken'
 *        404:
 *          description: User was not found in system or no username or password were supplied
 *        409:
 *          description: The supplied password was incorrect
 *        500:
 *          description: There was an issue with logging in
 */
router.post('/login', async( req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try{
            
            if(err|| !user){
                // Check the info sent back from the passport login script
                let error;

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
                const userObj = new userModel({});
                const token = await userObj.generateAccessToken({ user: body });
                return res.json({ token });
            });
        } catch(error) {
            return next(error);
        };
    })(req, res, next);
});

module.exports = router;