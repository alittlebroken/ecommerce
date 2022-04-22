// Required packages and classes
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const googleStrategy = require( 'passport-google-oauth2' ).Strategy;
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
                await userObj.update({ column: 'last_logon', value: 'CURRENT_TIMESTAMP', id: user.user_id });

                return done(null, user, { message: 'Logged in successfully'});
            } catch(error) {
                return done(error);
            }
        }
    )
);

/**
 * passport verification for google
 */
passport.use(
    'googleLogin',
    new googleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URL,
            passReqToCallback: true,
        },
        async(request, accessToken, refreshToken, email, profile, done) => {

            /**
             * Do we already have this google ID stored in the DB
             */
            try {

                const userObj = new userModel();
                const user = await userObj.findByGoogleId(profile.id);

                if(user){
                    /**
                     * Return the details found for the user
                     */
                    return done(null, user, { message: 'Google account found, logging in' });
                } else {
                    /**
                     * No user found create the account
                     */
                    const newUser = await userObj.createGoogleUser(profile);
                    if(newUser){
                        /**
                         * return the new user
                         */
                        return done(null, newUser,{ message: 'Adding google auth to internal systems for future use' });
                    } else {
                        return done(null, false, { message: 'Unable to use google auth to login' });
                    }
                }

            } catch(err) {
                return done(err);
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