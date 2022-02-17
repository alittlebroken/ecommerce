const express = require('express');
const router = express.Router()
const db = require('../db/db')
const passport = require('passport')

// Load any utils
const ROLES = require('../utils/roles');
const UTILS = require('../utils/auth');

// require some of the order models
const orderModel = require('../models/order')
const orderItemModel = require('../models/orderItem')

/**
 * @swagger
 * definitions:
 *   Order:
 *     type: object
 *     properties:
 *       order_id:
 *         type: integer
 *       user_id:
 *         type: integer
 *       order_date:
 *         type: string
 *         format: date-time
 *       order_paid_for:
 *         type: boolean
 *       order_notes:
 *         type: string
 *       order_shipped:
 *         type: string
 *         format: date-time
 *       order_arrived:
 *         type: string
 *         format: date-time
 *       order_total_cost:
 *         type: number
 *         format: float
 *   ordersProducts:
 *     type: object
 *     properties:
 *       order_id: 
 *         type: integer
 *       product_id:
 *         type: integer
 *       quantity:
 *         type: integer
 *       total:
 *         type: number
 *         format: float
 *   orderUpdate:
 *     type: object
 *     properties:
 *       updates:
 *         type: array
 *         items:
 *           properties:
 *             column:
 *               type: string
 *             value:
 *               oneOf:
 *                 - type: string
 *                 - type: integer
 *                 - type: number
 *                 - type: boolean  
 */

// Check the parameters used
router.param('orderid', (req, res, next, orderid) => {

    // Check for the ids existance
    if(orderid){

        // Check if the id is of the correct format
        if(parseInt(orderid)){

            // Add the ID to the request body
            req.body.orderId = orderid;
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
 * /orders
 *   get:
 *     tags:
 *       - Orders
 *     description: Retrieve all orders
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns an array of orders
 *         schema:
 *           $ref: '#/definitions/Orders'
 *       404:
 *         description: Unable to find any orders
 */
router.get(
    '/', 
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin),
    async (req, res, next) => {

    // Query the DB and get a list of all orders
    try{

        // Get a list of orders
        const orders = new orderModel();
        const result = await orders.findOrders();

        // Check we have some orders to get
        if(result?.length){
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: 'Unable to find any orders'
            });
        }

    } catch(err) {
        next(err);
    }

});

/**
 * @swagger
 * /orders/orderid
 *   get:
 *     tags:
 *       - orders
 *     description: Retrieve an individual order
 *     produces:
 *       - application/json
 *     parameters:
 *       orderid:
 *         type: integer
 *         description: The ID of the order to retrieve
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Returns the desired product
 *         schema:
 *           $ref: '#/definitions/Order'
 *       404:
 *         description: Unable to find the order requested
 */
router.get(
    '/:orderid',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin), 
    async (req, res, next) => {

    // Extract the ID from the request body
    const id = req.body.orderId;

    // Query the DB and return the result
    try{

        const orders = new orderModel({ order_id: id });
        const result = await orders.findOrder();
        
        if(result?.length){
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: 'Unable to find the order'
            });
        }

    } catch(err) {
        next(err);
    }

});

/**
 * @swagger
 * /orders/orderid
 *   put:
 *     tags: 
 *       - orders
 *   description: Update the required order
 *   produces:
 *       - application/json
 *   parameters:
 *     - name: orderid
 *       type: integer
 *       description: The ID of the order to be updated
 *       in: path
 *       required: true
 *     - name: updates
 *       type: array
 *       description: An array of updates ot be applied
 *       in: body
 *       required: true
 *       schema:
 *         $ref: '#/definitions/orderUpdate'
 *   responses:
 *     201:
 *       description: Successfully updates order and returns it back
 *       schema:
 *         $ref: '#/definitions/Order'
 *     404:
 *       description: Unable to find and order to update
 */
router.put(
    '/:orderid',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin), 
    async (req, res, next) => {

    // Get the ID from the req body
    const id = req.body.orderId;

    // Get the updates from the req body
    const updates = req.body.updates;


    if(!updates?.length || updates == undefined || updates == null) {
        res.status(404).json({
            status: 404,
            message: 'No updates found'
        });
    }

    // Attempt to update
    try{
        
        const order = new orderModel();
        const result = await order.update({updates, order_id: id});
        
        if(result.length){
            res.status(201).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: 'Unable to update the order'
            });
        }

    } catch(err) {
        
        next(err);
    }

});

/**
 * @swagger
 * /orders/orderid
 *   delete:
 *     tags:
 *       - orders
 *     description: Delete a specific order
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: orderid
 *         type: integer
 *         description: The ID of an order to be deleted
 *         in: path
 *         required: true
 *     responses:
 *       201: 
 *         description: Successfully deletes the order and returns it
 *         schema:
 *           $ref: '#/definitions/Order'
 *       404:
 *         description: Unable to find an order to delete
 */
router.delete(
    '/:orderid',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin), 
    async (req, res, next) => {

    // Get the ID from the request body
    const id = req.body.orderId;

    // Attempt to delete the record
    try{

        // Delete
        const result = await orderModel.deleteById(id);

        if (result?.length){
            res.status(201).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: 'Unable to delete order'
            });
        }

    } catch(err) {
        next(err);
    }

});

module.exports = router;