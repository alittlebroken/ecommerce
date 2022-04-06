// Required packages and classes
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const userModel = require('../models/user');

// Create a user
passport.use(
    'register',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {

            try {

                const newUser = new userModel({
                    email: email,
                    password: password,
                    roles: 'Customer'
                });

                const user = await newUser.create();
                return done(null, user);

            } catch(err) {
                const error = new Error('The supplied email has already been registered.');
                error.status = 409;
                done(error);
            }
        }
    )
);

// Login a user
passport.use(
    'login',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try{
                
                const userObj = new userModel({ email: email });
                const user = await userObj.findByEmail();
                
                if(!user){
                    return done(null, false, { message: 'user not found'});
                }
                
                const validate = await userObj.verifyPassword(user.password,password);
                if(!validate){
                    return done(null, false, { message: 'Wrong password'});
                }
                // Update the last login time

                return done(null, user, { message: 'Logged in successfully'});
            } catch(error) {
                return done(error);
            }
        }
    )
);

// Verify the JWT token
passport.use(
    new JWTstrategy({
        secretOrKey: process.env.TOKEN_SECRET,
        jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
    },
    async(token, done) => {
        try{
            return done(null, token.user);
        } catch(error) {
            done(error);
        }
    }
    )
);