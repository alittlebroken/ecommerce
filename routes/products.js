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

/**
 * @swagger
 * definitions:
 *   Product:
 *     type: object
 *     properties:
 *       product_id:
 *         type: integer
 *       name:
 *         type: string
 *       description:
 *         type: string
 *       price:
 *         type: numeric
 *         format: float
 *       image_url:
 *         type: string
 *       in_stock:
 *         type: boolean
 */

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

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     description: Create a new product
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: data
 *         description: Contaisn various values to create a new product
 *         in: body
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Product'
 *     responses:
 *       201:
 *         description: Successfully created product
 *       400:
 *         description: Supplied values in incorrect format
 *       404:
 *         description: Required values are missing
 *       
 */
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

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     description: Get a list of the products
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *        description: Returns an array of products
 *        schema:
 *          $ref: '#/definitions/Product'
 *       404:
 *         description: no products found
 */
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

/**
 * @swagger
 * /products/top5:
 *   get:
 *     tags:
 *       - Products
 *     description: Get a list of the top 5 popular products
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *        description: Returns an array of products
 *        schema:
 *          $ref: '#/definitions/Product'
 *       404:
 *         description: no products found
 */
router.get('/top5', async (req, res, next) => {

    /**
     * Get the required data from the DB
     */
    try{

        /** 
         * Get the data
         */
        const products = new productModel();
        const result = await products.getTopFiveProducts();

        /**
         * Chek we have data to send back
         */
        if(result){
            res.status(200).json(result);
        } else {
           res.status(404).json({
               status: 404,
               message: 'No products found'
           });
        }

    } catch (error) {
       next(error);
    }

});

/**
 * @swagger
 * /products/{productid}:
 *   get:
 *     tags:
 *       - Products
 *     description: Retrieve a specific product
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array containing the required product
 *         schema:
 *           $ref: '#/definitions/Product'
 *       404:
 *         description: No product found
 */
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

/**
 * @swagger
 * /products/{productid}:
 *   put:
 *     tags:
 *       - Products
 *     description: Update the specified product
 *     produces:
 *       - application:/json
 *     parameters:
 *       - name: data
 *         description: Product object to update
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Product'
 *     responses:
 *       200:
 *         description: returns the found product
 *         schema:
 *           $ref: '#/definitions/Product'
 *       400:
 *         description: Unable to update the product in the database
 *       404:
 *         description: Unable to find the product to be updated      
 *         
 */
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

/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     tags:
 *       - Products
 *     description: Delete the specified product
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: productId
 *         description: ID of the product to be deleted
 *         in: path
 *         required: true
 *     responses:
 *       201:
 *         description: Successfully deletes product and returns deleted product
 *         schema:
 *            $ref: '#/definitions/Product'
 *       404:
 *         description: Unable to find the requested product that is to be deleted
 */
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

/**
 * @swagger
 * /products:
 *   delete:
 *     tags:
 *       - Products
 *     description: Deletes all products
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully deletes all products
 *       400:
 *         description: Unable to delete the products
 */
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