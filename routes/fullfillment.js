// Require needed packages
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const fulfillment = require('../utils/fulfillment');

// Get any needed environment variables
require('dotenv').config();

// Stripe payment system
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

// Import the cart model
const cartModel = require('../models/carts');
const orderModel = require('../models/order');

// Load any utils
const ROLES = require('../utils/roles');
const UTILS = require('../utils/auth');

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET

/**
 * @swagger
 * definitions:
 *   stripeSession:
 *     type: object
 *     properties:
 *       client_reference_id:
 *         type: integer
 *       amount_total:
 *         type: integer
 *         format: float
 */

/**
 * @swagger
 * /fulfill/order:
 *   post:
 *     tags:
 *       - Fulfillment
 *       - Orders
 *     description: Creates an order once the Stripe payment system notifies us that the user was charged for our goods
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: stripePayload
 *         type: object
 *         description: Stripe session object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/stripeSession'
 *       - name: stripeSignature
 *         type: string
 *         description: Signature sent so we know request came from the strip payment system and not a third party
 *         in: header
 *         required: true
 *     responses:
 *       200:
 *         description: Notifies stripe the order was fulfilled
 *       400:
 *         description: Notifies stripe there was an issue with the fulfillment of the order
*/     
router.post(
    '/order',
    async (req, res, next) => {

        // Get the Stripe Payload
        const stripePayload = req.body;
        

        // Get the signature to ensure that only stripe can access the route
        const stripeSignature = req.headers['stripe-signature'];

        // Holds the event type from stripe
        let event;

        // Construct the event
        try{

            event = stripe.webhooks.constructEvent(
                stripePayload,
                stripeSignature,
                endpointSecret
            );

        } catch(err) {
            console.log(`Stripe webhook error: ${err.message}`)
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Fulfill the order
        if(event.type === 'checkout.session.completed'){
            const session = event.data.object;
            fulfillment.fulfillOrder(session);
        }

        res.status(200);
    }
);

// Export the router
module.exports = router;