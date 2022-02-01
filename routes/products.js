// Imports for the route
const express = require('express');
const router = express.Router()
const db = require('../db/db')

// Make use of required Models
const productModel = require('../models/products')

// Check the productId param is OK and add to the request body
router.param('productId', (req, res, next, productId) => {

    // Check the id has actually been sent
    if(productId != null || productId != undefined){

        // Check that productId is in the correct format
        if(parseInt(productId)){

            // Attach the product id to the request body
            req.body.product_id = productId;
            next();

        } else {
            const err = new Error("Unable to find parameterId in the correct format");
            err.status = 404;
            next(err);
        }

    } else {
        const err = new Error("Unable to find the productId parameter");
        err.status(404);
        next(err);
    }

});

// Handle the POST route
router.post('/', async (req, res, next) => {

    // Get the values from the reqwuest body
    const { name, description, price, image_url, in_stock } = req.body;

    // Check that there is data to be added
    if(name != null || name != undefined && description != null || description != undefined && price != null || price != undefined ){

        // Now add the record
        try{

            if(!parseInt(price)){
                
                const error = new Error("Supplied value not in correct format");
                error.status = 400;
                return next(error);

            }

            const result = await productModel.add({
                name,
                description,
                price,
                image_url,
                in_stock
            });

            // Check if the product was added
            if(result){
                return res.status(201).json(result);
            } else {
                return res.status(400).json({status: 400, message: "Unable to add product resource"});
            }

        } catch(err) {
            return next(err);
        }
        
    } else {
        
        const err = new Error("Missing one or more required values");
        err.status(404);
        return next(err);
    }

});

// Handle the GET all route
router.get('/', async (req, res, next) => {

    // get the data from the DB
    try{
        
        // Assign the result from the DB
        const resultSet = await productModel.findAll();

        // Check we have some data to send back
        if(resultSet.length){
            res.status(200).json(resultSet);
        } else {
            res.status(400).json({
                status: 400,
                message: "Unable to retrieve list of products"
            })
        }

    } catch(err) {
        next(err);
    }

});

// Get a product by ID
router.get('/:productId', async (req, res, next) => {

    // Get the required data from the DB
    try{

        // Get the product ID
        const productId = req.body.product_id;

        // Perform the query
        const result = await productModel.findById(productId);

        if(result){
            res.status(200).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: "Unable to retrieve the specified product"
            })
        }

    } catch(err) {
        next(err);
    }

});

// Update a product
router.put('/:productId', async (req, res, next) => {

    // Extract data from the request body
    const {
        product_id,
        name,
        description,
        price,
        image_url,
        in_stock
    } = req.body;

    // Update the record
    try{

        // Update
        const result = await productModel.update({ product_id, name, description, price, image_url, in_stock });
        
        if(result){
            res.status(200).json(result);
        } else if (result == undefined || result == null ){ 
            res.status(404).json({
                status: 404,
                message: "Unable to update the product in the database"
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Unable to update the product in the database"
            });
        }

    } catch(err) {
        next(err);
    }

});

// Delete a product from the database
router.delete('/:productId', async (req, res, next) => {

    // attempt to delete the record from the db
    try{

        const result = await productModel.deleteById(req.body.product_id);

        if(result){
            res.status(201).json(result);
        } else {
            res.status(404).json({
                status: 404,
                message: 'Unable to remove product'
            });
        }

    } catch(err) {
        next(err);
    }

});

// Delete all products from the DB
router.delete('/', async (req, res, next) => {

    // Delete the products
    try{

        const result = await productModel.deleteAll();

        if(result){
            res.status(200).json(result);
        } else {
            res.status(400).json({
                status: 400,
                message: 'Unable to remove all products'
            });
        }

    } catch(err) {
        next(err);
    }

});

// Export the router to be used by the app
module.exports = router;