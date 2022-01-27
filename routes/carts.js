// Imports for the route
const express = require('express');
const createHttpError = require('http-errors');
const router = express.Router()
const db = require('../db/db')

// Make use of required Models
const cartModel = require('../models/carts')


// Check all params used in this route
// ID for a cart
router.param('cartid', (req, res, next, cartid) => {

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
router.post('/', async (req, res, next) => {

    // Check we have data to process
    if(req.body.userId){

       // Attempt to create the cart for the user
       try{

        const result = await cartModel.create(req.body.userId);
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
router.post('/:cartid', async (req, res, next) => {

    // assign data from the req body and params
    const cartId = req.body.cartId;
    const { productId } = req.body.items[0];

    try{

        const result = await cartModel.addToCart({
            cartId, productId, quantity: 1
        });
        res.status(201).json(result);

    } catch(err) {
       next(err); 
    } 
});


// Get all carts in the database
router.get('/', async (req, res, next) => {

    try{
        const result = await cartModel.findAllCarts();
        res.status(200).json(result);
    } catch(err) {
        next(err);
    }

});

// Get a certain carts contents
router.get('/:cartid', async (req, res, next) => {

    // Extract the cart ID
    const id = parseInt(req.body.cartId);
    
    // run the query and get the results
    try{
        
        const result = await cartModel.findAllCartItems({ cartId: id });
        
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
router.put('/:cartid/items/:itemid', async (req, res, next) => {

    // Get the data from the request
    const { quantity } = req.body;
    const cartId = req.body.cartId;
    const itemId = req.body.itemId;

    // Update the item in the cart
    try{
        const result = await cartModel.updateCartItem({
            cartId,
            productId: itemId,
            quantity
        });

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
router.delete('/:cartid', async (req, res, next) => {
    const cartId = req.body.cartId;

    try{

        // Delete the cart contents
        const result = await cartModel.removeAllCartItems({ cartId });
        
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
router.delete('/:cartid/items/:itemid', async (req, res, next) => {

    // Get the required params
    const cartId = req.body.cartId;
    const itemId = req.body.itemId;

    // Attempt to the delete the item
    try{
        const result = await cartModel.removeCartItem({ cartId, productId: itemId });

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