// Require needed packages
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Get any needed environment variables
require('dotenv').config();

// Stripe payment system
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

// Import the cart model
const cartModel = require('../models/carts');

// Load any utils
const ROLES = require('../utils/roles');
const UTILS = require('../utils/auth');

// Check all params used in this route
// ID for a cart
router.param('cartid',(req, res, next, cartid) => {

    // Check for the ids existance
    if(cartid){

        // Check if the id is of the correct format
        if(parseInt(cartid)){

            // Add the ID to the request body
            req.body.cartId = cartid;
            next();

        } else {
            const err = new Error('The parameter is not of the expected format');
            err.status = 400;
            next(err);
        }

    } else {
        const error = new Error('Unable to find the required parameter')
        error.status = 404;
        next(error);
    }

});

/**
 * @swagger
 * /checkout/{cartid}:
 *   post:
 *     tags:
 *       - checkout
 *     description: Performs checkout of a users cart and sends the cart data to stripe
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cartid
 *         type: integer
 *         description: The ID of the users cart
 *         in: path
 *         required: true
 *     responses:
 *       404:
 *         description: Unable to find the specified cart
 */
router.post(
    `/:cartid`,
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer), 
    async (req, res, next) => {

    // Get the cart ID from the req body
    const cart_id = req.body.cartId;
    
    if(!cart_id){
        return res.status(404).json({
            status: 404,
            message: "Missing required parameter from request"
        });
    };

    // Get the cart items
    const cartInstance = new cartModel({ cartId: cart_id });
    const cart = await cartInstance.findAllCartItems();

    if(!cart){
        return res.status(404).json({
            status: 404,
            message: "Unable to find cart using supplied parameters"
        });
    }

    // Create the items to send with stripe
    const stripeItemData =
        cart.map(cartItem => {
            return {
                price_data: {
                    currency: process.env.STRIPE_CURRENCY,
                    product_data: {
                        name: cartItem.name
                    },
                    unit_amount: cartItem.price * 100
                },
                quantity: cartItem.quantity
            }
        });

    // Create the session and send back the url for the checkout
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: stripeItemData,
        mode: 'payment',
        client_reference_id: cart_id,
        success_url: `${process.env.CLIENT_URL}/sucess`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    return res.json({ url: session.url});
});

module.exports = router;