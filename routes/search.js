// Imports for the route
const express = require('express');
const router = express.Router()


// Make use of required Models
const productModel = require('../models/products')

/**
 * @swagger
 * definitions:
 *    Product:
 *      properties:
 *        product_id:
 *          type: integer
 *        name:
 *          type: string
 *        description:
 *          type: string
 *        price:
 *          type: number
 *        image_url:
 *          type: string
 *        in_stock:
 *          type: boolean
 *        catgeory:
 *          type: integer
 */

/**
 * @swagger
 * /search:
 *   post:
 *     tags:
 *       - search
 *     description: Returns a list of products
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: searchTerms
 *         description: Product name to search for
 *         in: body
 *         required: true
 *       - name: category
 *         description: Category that the product is in
 *         in: path
 *         required: false
 *     responses:
 *       200:
 *         description: An array of products
 *         schema:
 *           $ref: '#/definitions/Product'
 *       404:
 *         description: When no product found returns an empty array
 */
router.post('/', async (req, res, next) => {

    // Extract search terms and category from the request
    const terms = req.body.searchTerms;
    const category = req.query.category;

    try{

        // Create an instance of the productModel
        const productModelInstance = new productModel({
            name: terms,
            category: category
        });

        // perform the search and capture the results
        const results = await productModelInstance.search();

        // Check the results
        if(!results){
            /*
                No products found
            */
            res.status(404).json([]);
        } else {
            res.status(200).json(results);
        }

    } catch(err) {
        next(err);
    }
    
});


// Export the router
module.exports = router;