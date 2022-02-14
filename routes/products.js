// Imports for the route
const express = require('express');
const router = express.Router()
const db = require('../db/db')
const passport = require('passport')

// Load any utils
const ROLES = require('../utils/roles');
const UTILS = require('../utils/auth');

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

// Handle the POST route, only for admins
router.post(
    '/',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin),
    async (req, res, next) => {

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

            const product = new productModel({
                name,
                description,
                price,
                image_url,
                in_stock
            })
            const result = await product.add();

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
        err.status = 404;
        return next(err);
    }

});

// Handle the GET all route
router.get('/', async (req, res, next) => {

    // get the data from the DB
    try{
        
        // Assign the result from the DB
        const products = new productModel();
        const resultSet = await products.findAll();

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
        const product = new productModel({ product_id: productId });
        const result = await product.findById();

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

// Update a product, admins only
router.put(
    '/:productId',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin), 
    async (req, res, next) => {

    // Update the record
    try{

        // Update
        
        const product = new productModel(req.body);
        const result = await product.update();
        
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

// Delete a product from the database, again admin only
router.delete(
    '/:productId',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin), 
    async (req, res, next) => {

    // attempt to delete the record from the db
    try{

        const product = new productModel({ product_id: parseInt(req.body.product_id) });
        const result = await product.deleteById();

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

// Delete all products from the DB, admin user only
router.delete(
    '/',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin), 
    async (req, res, next) => {

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