// Imports for the route
const express = require('express');
const createHttpError = require('http-errors');
const router = express.Router()
const db = require('../db/db')
const passport = require('passport')

// Load any utils
const ROLES = require('../utils/roles');
const UTILS = require('../utils/auth');

// Make use of required Models
const cartModel = require('../models/carts')


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

// Check the itemID parameter
router.param('itemid', (req, res, next, itemid) => {

    // Check for the ids existance
    if(itemid){

        // Check if the id is of the correct format
        if(parseInt(itemid)){

            // Add the ID to the request body
            req.body.itemId = itemid;
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

// Create the routes

// POST 
// Create a new cart
router.post(
    '/',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer), 
    async (req, res, next) => {

    // Check we have data to process
    if(req.body.userId){

       // Attempt to create the cart for the user
       try{

        const cart = new cartModel({ userId: req.body.userId});
        const result = await cart.create();
        res.status(201).json(result);

       } catch(err) {
           const error = new Error("Unable to add cart as it already exists")
           error.status = 400;
           return next(error);
       }

    } else {
        const error = new Error('Missing required data from request body')
        error.status = 404;
        next(error);
    }
 
});

// Add a product to the cart
router.post(
    '/:cartid',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer),  
    async (req, res, next) => {

    // assign data from the req body and params
    let cartID, productId;
    if(!req.body.items || req.body.items == undefined || req.body.items == null) {
        res.status(404).send(
            {
                status: 404,
                message: "Required data is missing from the request body"
            }
        )
    } else {
        cartId = req.body.cartId;
        productId = req.body.items[0].productId;
    }

    try{
        const cart = new cartModel({
            cartId,
            productId
        });
        const result = await cart.addToCart();
        res.status(201).json(result);

    } catch(err) {
       next(err); 
    } 
});


// Get all carts in the database
router.get(
    '/', 
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin), 
    async (req, res, next) => {

    try{
        const cart = new cartModel();
        const result = await cart.findAllCarts();
        res.status(200).json(result);
    } catch(err) {
        next(err);
    }

});

// Get a certain carts contents
router.get(
    '/:cartid',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer), 
    async (req, res, next) => {

    // Extract the cart ID
    const id = parseInt(req.body.cartId);
    
    // run the query and get the results
    try{
        const cart = new cartModel({ cartId: id });
        const result = await cart.findAllCartItems({ cartId: id });
    

        if(!result){
            res.status(404).json({ status: 404, message: "The cart specified contains no items"});
        } else {
            res.status(200).json(result);
        }

    } catch(err) {
        next(err);
    }

});

// Update a carts contents
router.put(
    '/:cartid/items/:itemid',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer),  
    async (req, res, next) => {

    // Get the data from the request
    const { quantity } = req.body;
    const cartId = req.body.cartId;
    const itemId = req.body.itemId;

    // Update the item in the cart
    try{
        const cart = new cartModel({
            cartId,
            productId: itemId,
            quantity
        });

        const result = await cart.updateCartItem();

        if(result){
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: "Unable to find cart item to update"
            })
        }

    } catch(err) {
        next(err);
    }

});

// Delete a carts contents
router.delete(
    '/:cartid',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer),  
    async (req, res, next) => {
    const cartId = req.body.cartId;

    try{

        // Delete the cart contents
        const cart = new cartModel({ cartId });
        const result = await cart.removeAllCartItems();
        
        if(result){
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: "Unable to find cart items to remove"
            })
        }

    } catch(err) {
        next(err);
    }
});

// Delete a specific item from the cart
router.delete(
    '/:cartid/items/:itemid',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer),  
    async (req, res, next) => {

    // Get the required params
    const cartId = req.body.cartId;
    const itemId = req.body.itemId;

    // Attempt to the delete the item
    try{
        const cart = new cartModel({ cartId, productId: itemId });
        const result = await cart.removeCartItem();

        if(result){
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: 'Unable to find cart item to remove'
            });
        }

    } catch(err) {
        next(err);
    }

});

// Export the router
module.exports = router;