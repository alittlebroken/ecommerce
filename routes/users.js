const express = require('express');
const createHttpError = require('http-errors');
const { RowDescriptionMessage, CommandCompleteMessage } = require('pg-protocol/dist/messages');
const router = express.Router()
const db = require('../db/db')

// Check that any required params are set correctly
router.param("userid", (req, res, next, userid) => {

    // CHeck we have a user Id passed in
    if(userid){

        // We need to ensure the passed in ID is an integer
        if(parseInt(userid) || userid == null || userid == undefined){

            // Add the user id to the request body
            req.body.userid = parseInt(userid);
            next();

        } else {
            const error = new Error("The URI parameter is not of the expected format")
            error.status = 400;
            next(error);
        }
        
    } else {
        const error = new Error("Unable to find the required parameter")
        error.status = 404;
        next(error);
    }

});

// Check that any routes with orderid are correctly set
router.param("orderid", (req, res, next, orderid) => {

    // Only proceed if we have an order id
    if(orderid){

        // Ensure the passed in parameter is an integer
        if(parseInt(orderid) || orderid == null || orderid == undefined){

            // Add the user id to the request body
            req.body.orderid = parseInt(orderid);
            next();

        } else {
            const error = new Error("The URI parameter is not of the expected format")
            error.status = 400;
            next(error);
        }

    } else {
        const error = new Error("Unable to find the required parameter")
        error.status = 404;
        next(error);
    }

});

// Get a list of all users
router.get('/', async (req, res, next) => {

    // Attempt to query the DB and retrieve the records and send them back
    try{
        const response = await db.query('SELECT * FROM users','');
        res.status(200).json(response.rows);
    } catch(err) {  
        return next(err);
    }
   
});

// Get an individuals ID from the database
router.get('/:userid', async (req, res, next) => {

    try{
        const response = await db.query('SELECT * FROM users WHERE user_id = $1',[req.body.userid]);
        if(response.rowCount === 0){
            const error = new createHttpError(404, "No records were found with the specified parameters");
            return next(error);
        }
        res.status(200).json(response.rows);
    } catch(err) {
        return next(err);
    }

});

// Add a user to the database
router.post('/', async (req, res, next) => {

    // Generate the sql
    
    // If a user id has been provided lets use that instead
    let query = "INSERT INTO users(email, password, forename, surname, contact_number \
        ) VALUES($1, $2, $3, $4, $5) RETURNING user_id;";

    // Get the data from the request body
    const data = req.body;

    // Check that we have valid values
    if(!data.email || !data.password || !data.forename || !data.surname || !data.contact_number){
        const err = new Error("One or more values are missing from the request");
        err.status = 404;
        next(err);
    } else {
        // Assign the values to an array so we can pass them along with query to run against db
        let values = [data.email, data.password, data.forename, data.surname, data.contact_number];

        try{

            const response = await db.query(query, values);
            res.status(201).json(response.rows);

        } catch(err) {
            return next(err);
        }

    }
    

});

router.delete('/:userid', async (req, res, next) => {

    // As always get the ID from the request
    const id = req.body.userid;
    // generate the sql
    const query = `DELETE FROM users WHERE user_id = $1;`;

    try {

        const response = await db.query(query, [id]);
        
        if(response.rowCount > 0){
            res.status(200).json({
                status: 200,
                message: `Record #${id} deleted`
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'The specified record does not exist'
            })
        }
        
    } catch(err) {
        return next(err);
    }

});

router.put('/:userid', async (req, res, next) => {

    // Extract the user ID for the update command
    let user_id = req.body.userid;
    let data = req.body;
    const datalen = data.data.length;
    let values = [];
    let query;

    if(data){

        query = `UPDATE users SET `;

        data.data.forEach( (item, index) => {
            if(index < datalen - 1){
                query += `${item.column} = $${index +1}, `;
                values.push(item.value);
            } else {
                query += `${item.column} = $${index +1} `;
                values.push(item.value);
            }
        });

        values.push(user_id);
        query += `WHERE ${data.table_key_col} = $${datalen +1};`;

    }

    try{
        await db.query(query, values);
        res.status(200).json({
            state: "SUCCESS",
            status: 200,
            message: `Record ${user_id} updated successfully`
        });
    } catch(err) {
        return next(err);
    }

});

// Get all orders for the specified user
router.get('/:userid/orders', async (req, res, next) => {

    // get the relevant information from the the request
    const id = req.body.userid;

    // Generate the query
    let query = "SELECT * FROM orders WHERE user_id = $1;";

    try{
        const response = await db.query(query, [id]);
        if(response.rowCount === 0){
            const error = new createHttpError(404, "No records were found with the specified parameters");
            return next(error);
        }
        res.status(200).json(response.rows);
    } catch(err) {
        return next(err);
    }

});

// Get an individual order for a user
router.get('/:userid/orders/:orderid', async (req, res, next) => {
    // Get the user and order ids form the request body
    const userId = req.body.userid;
    const orderId = req.body.orderid;

    // generate the query

    let query = "SELECT * FROM orders WHERE order_id = $1 and user_id = $2;";

    // Perform the query
    try{
        const response  = await db.query(query, [orderId, userId]);
        
        if(response.rowCount === 0){
            const error = new createHttpError(404, "No records were found with the specified parameters");
            return next(error);
        }
        res.status(200).json(response.rows);
    } catch(err) {
        return next(err);
    }

});

module.exports = router;