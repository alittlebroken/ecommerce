const express = require('express');
const createHttpError = require('http-errors');
const router = express.Router()
const db = require('../db/db')
const passport = require('passport')

/**
 * Database Models
 */
const orderModel = require('../models/order');

// Load any utils
const ROLES = require('../utils/roles');
const UTILS = require('../utils/auth');

/**
 * @swagger
 * definitions:
 *    User:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          format: int64
 *        email:
 *          type: string
 *        password:
 *          type: string
 *        is_admin:
 *          type: boolean
 *        is_logged_in:
 *          type: boolean
 *        last_logon:
 *          type: string
 *          format: date-time
 *        roles:
 *          type: string
 *    Update:
 *        type: object
 *        properties:
 *          table_key_col:
 *            type: string
 *          data:
 *            type: array
 *            items:
 *              properties:
 *                column:
 *                 type: string
 *                value:
 *                 type: string     
 *    Order:
 *        type: object
 *        properties:
 *          order_id:
 *            type: integer
 *          user_id:
 *            type: integer
 *          order_date:
 *            type: string
 *            format: date-time
 *          order_paid_for:
 *            type: boolean
 *          order_notes:
 *            type: string
 *          order_shipped:
 *            type: string
 *            format: date-time
 *          order_arrived:
 *            type: string
 *            format: date-time
 *          order_total_cost:
 *            type: number
 *            format: float   
 */

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

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     description: returns a list of users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of users
 *         schema:
 *           $ref: '#/definitions/User'      
 */
router.get(
    '/',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin),
    async (req, res, next) => {

    // Attempt to query the DB and retrieve the records and send them back
    try{
        const response = await db.query('SELECT * FROM users','');
        res.status(200).json(response.rows);
    } catch(err) {  
        return next(err);
    }
   
});

/**
 * @swagger
 * /users/{userid}:
 *   get:
 *     tags:
 *       - Users
 *     description: returns a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: ID of a user to retrieve
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Returns the specified user
 *         schema:
 *           $ref: '#/definitions/User'
 *       404:
 *         description: No records found with the specified parameters 
 */
router.get(
    '/:userid',
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer), 
    async (req, res, next) => {
    
    try{
        const response = await db.query(`SELECT user_id, email, forename, surname,
         join_date, last_logon, enabled, roles, avatar_url, google, contact_number 
         FROM users WHERE user_id = $1`,[req.body.userid]);
        if(response.rowCount === 0){
            const error = new createHttpError(404, "No records were found with the specified parameters");
            return next(error);
        }
        res.status(200).json(response.rows);
    } catch(err) {
        return next(err);
    }

});

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     description: create a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: data
 *         description: user object
 *         in: body
 *         required: true
 *         schema:
 *          $ref: '#/definitions/User'
 *     responses:
 *       201:
 *         description: Successfully created
 *       404:
 *         description: One or more values are missing from the request 
 */
router.post(
    '/', 
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin),
    async (req, res, next) => {

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

/**
 * @swagger
 * /users/{userid}:
 *   delete:
 *     tags:
 *       - Users
 *     description: delete a user 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: ID of the user to delete
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Record #userid deleted
 *       404:
 *         description: The specified record does not exist 
 */
router.delete(
    '/:userid', 
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin),
    async (req, res, next) => {

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

/**
 * @swagger
 * /users/{userid}:
 *   put:
 *     tags:
 *       - Users
 *     description: Update the user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: ID of the user to update
 *         in: path
 *         required: true
 *         type: integer
 *       - name: data
 *         description: update object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Update'
 *     responses:
 *       200:
 *         description: Record #userid deleted
 *       404:
 *         description: The specified record does not exist 
 */
router.put(
    '/:userid', 
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer),
    async (req, res, next) => {

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

/**
 * @swagger
 * /users/{userid}/orders:
 *   get:
 *     tags:
 *       - Users
 *       - Orders
 *     description: Get all orders associated with a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: ID of the user to get orders for
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: An array of orders is returned for the user
 *         schema:
 *           $ref: '#/definitions/Order'
 *       404:
 *         description: No records were found with the specified parameters 
 */
router.get(
    '/:userid/orders', 
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer),
    async (req, res, next) => {

    // get the relevant information from the the request
    const id = req.body.userid;

    // Generate the query
    let query = "SELECT * FROM orders WHERE user_id = $1;";

    try{
        const response = await db.query(query, [id]);
        if(response.rowCount === 0){
            
            const error = new createHttpError(204, "No records were found with the specified parameters");
            return next(error);
            
            //res.status(204).json()
        }
        res.status(200).json(response.rows);
    } catch(err) {
        return next(err);
    }

});

/**
 * @swagger
 * /users/{userid}/orders/{orderid}:
 *   get:
 *     tags:
 *       - Users
 *       - Orders
 *     description: Get a users specific order
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: ID of the user to get orders for
 *         in: path
 *         required: true
 *         type: integer
 *       - name: orderid
 *         description: ID of the order being retrieved
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: An array of the specified order
 *         schema:
 *           $ref: '#/definitions/Order'
 *       404:
 *         description: No records were found with the specified parameters 
 */
router.get(
    '/:userid/orders/:orderid', 
    passport.authenticate('jwt', { session: false }), 
    UTILS.checkUserRoles(ROLES.Admin, ROLES.Customer),
    async (req, res, next) => {
    // Get the user and order ids form the request body
    const userId = req.body.userid;
    const orderId = req.body.orderid;

    // Perform the query
    try{

        const order = new orderModel({order_id: orderId, user_id: userId});
        const returnData = await order.findOrder()
        if(!returnData){
            const error = new createHttpError(404, "No records were found with the specified parameters");
            return next(error);
        }
        
        res.status(200).json(returnData);
    } catch(err) {
        return next(err);
    }

});

module.exports = router;