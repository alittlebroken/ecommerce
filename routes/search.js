// Imports for the route
const express = require('express');
const router = express.Router()


// Make use of required Models
const productModel = require('../models/products')

// Main search route
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