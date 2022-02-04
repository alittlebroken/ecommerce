const express = require('express');
const router = express.Router()
const db = require('../db/db')

// require some of the order models
const orderModel = require('../models/order')
const orderItemModel = require('../models/orderItem')

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

// Create the routes

// Route for getting all orders
router.get('/', async (req, res, next) => {

    // Query the DB and get a list of all orders
    try{

        // Get a list of orders
        const result = await orderModel.findOrders();

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

// Route for getting an individual Order from the DB
router.get('/:orderid', async (req, res, next) => {

    // Extract the ID from the request body
    const id = req.body.orderId;

    // Query the DB and return the result
    try{

        const result = await orderModel.findOrder(id);
        
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

// Update an order
router.put('/:orderid', async (req, res, next) => {

    // Get the ID from the req body
    const id = req.body.orderId;

    // Get the updates from the req body
    const updates = req.body.updates;
    if(!updates?.length) return res.status(404);

    // Attempt to update
    try{
        
        const result = await orderModel.update({updates, order_id: id});
        
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

// Delete an order
router.delete('/:orderid', async (req, res, next) => {

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