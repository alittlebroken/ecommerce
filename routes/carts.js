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

/**
 * @swagger
 * definitions:
 *   Item:
 *     type: array
 *     items:
 *       properties:
 *         product_id:
 *           type: integer
 *   cartItem:
 *     type: object
 *     properties:
 *       cart_id:
 *         type: integer
 *       product_id:
 *         type: integer
 *       quantity: 
 *         type: integer
 *   Cart:
 *     type: object
 *     properties:
 *       cart_id:
 *         type: integer
 *       user_id:
 *         type: integer
 *   cartProduct:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *       cart_id:
 *         type: integer
 *       quantity:
 *         type: integer
 *       product_id:
 *         type: integer
 *       name:
 *         type: string
 *       description:
 *         type: string
 *       price:
 *         type: number
 *         format: float
 *       image_url:
 *         type: string
 *       in_stock:
 *         type: boolean
 */

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

/**
 * @swagger
 * /carts:
 *   post:
 *     tags:
 *       - Carts
 *     description: Creates a new cart for a user
 *     produces:
 *       - application/json
 *     parameters:
 *       userId:
 *         type: integer
 *         description: The ID of the user to create a cart for
 *         in: body
 *         required: true
 *     responses:
 *       201:
 *         description: Successfully creates cart and returns cart ID
 *       400: 
 *         description: A cart for the user already exists
 *       404:
 *         description: Unable to find a user to create a cart for   
 */
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

/**
 * @swagger
 * /carts/{cartid}:
 *   post:
 *     tags:
 *       - Carts
 *     description: Adds a product to the users cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cartid
 *         description: The ID of the cart the item is to be added to
 *         type: integer
 *         in: path
 *         required: true
 *       - name: items
 *         description: An array of one or more items to add to the cart
 *         type: array
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Item'
 *     responses:
 *       201:
 *         description: Successfully added the product to the cart and returns the item added
 *         schema:
 *           $ref: '#/definitions/cartItem'
 *       404: 
 *         description: Unable to find the cart or the product to add to it
 */
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


/**
 * @swagger
 * /carts:
 *   get:
 *     tags:
 *       - Carts
 *     description: Returns all carts
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns all found carts
 *         schema:
 *           $ref: '#/definitions/Cart'
 */
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

/**
 * @swagger
 * /carts/{cartid}:
 *   get:
 *     tags:
 *       - Carts
 *     description: gets all items for a cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cartid
 *         description: The ID of the cart to get the items for
 *         in: path
 *         type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: returns an array of items for the cart
 *         schema:
 *           $ref: '#/definitions/cartProduct'
 *       404:
 *         description: Either there is no cart with the specified ID or it has no items
 */
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
            res.status(204).json({ status: 204, message: "The cart specified contains no items"});
        } else {
            res.status(200).json(result);
        }

    } catch(err) {
        next(err);
    }

});

/**
 * @swagger
 * /carts/{cartid}/items/{itemid}:
 *   put:
 *     tags:
 *       - Carts
 *     description: Updates an item in the cart
 *     produces:
 *       - application.json
 *     parameters:
 *       - name: cartid
 *         description: ID of the cart
 *         type: integer
 *         in: path
 *         required: true
 *       - name: itemid
 *         description: ID of the item to be updated
 *         type: integer
 *         in: path
 *         required: true
 *       - name: quantity
 *         type: integer
 *         description: The new quantity of the item
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully updated the item and returns the updated record
 *         schema:
 *           $ref: '#/definitions/cartItem' 
 *       404:
 *         description: Either the cart or item could not be found
 */
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

/**
 * @swagger
 * /carts/{cartid}:
 *   delete:
 *     tags:
 *       - Carts
 *     description: Deletes a cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cartid
 *         description: The ID of the cart
 *         type: integer
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully deletes the cart and returns it
 *         schema:
 *           $ref: '#/definitions/Cart'
 *       404:
 *         description: Unable to find the cart to delete
 */
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

/**
 * @swagger
 * /carts/{cartid}/items/{itemid}:
 *   delete:
 *     tags:
 *       - Carts
 *     description: Deletes an item from the cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cartid
 *         description: ID of the cart
 *         type: integer
 *         in: path
 *         required: true
 *       - name: itemid
 *         description: IF of the item
 *         type: integer
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully removed the item and returns the item deleted
 *         schema:
 *           $ref: '#/definitions/cartItem'
 *       404:
 *         description: Unable to find the cart or item
 */
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