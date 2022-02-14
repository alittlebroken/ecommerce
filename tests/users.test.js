// Required Packages
const request = require('supertest');
const bcrypt = require('bcryptjs');

// Get access to environment vars
require('dotenv').config();

// Access the DB
const db = require('../db/db');

// Access the app
const app = require('../app');

// Load any models needed
const userModel = require('../models/user');

// Setup anby global vars needed for the tests
let adminToken;
let adminId;
let custToken;
let custId;
let userId;
let order2;

describe('Users', () => {

    // Setup and teardown for these tests
    beforeAll( async () => {

        // Create some users for the tests
        const adminUser = new userModel({
            email: "admin@ecommerceshop.com",
            password: "p4ssw0rd",
            roles: "Admin"
        });
        
        await adminUser.create();
        adminId = adminUser.id;

        const normalUser = new userModel({
            email: "customer@ecommerceshop.com",
            password: "l3tm31n",
            roles: "Customer"
        });
        await normalUser.create();
        custId = normalUser.id;

        // Log in two users ( An administrator and normal customer )
        const admUser = await request(app)
         .post('/auth/login')
         .type('application/json')
         .set('Accept', 'application/json')
         .send({
             email: 'admin@ecommerceshop.com',
             password: 'p4ssw0rd'
         })

         // Get the Admin token
         adminToken = admUser.body.token;

         // Now get a token for the user
         const customerUser = await request(app)
         .post('/auth/login')
         .type('application/json')
         .set('Accept', 'application/json')
         .send({
             email: 'customer@ecommerceshop.com',
             password: 'l3tm31n'
         })

         // Get the customers token
         custToken = customerUser.body.token;

        // Category Setup
        const catQuery = "INSERT INTO categories(name) VALUES($1) RETURNING category_id;";

        const cats = [
            { name: 'Books'},
            { name: 'Gardening'},
            { name: 'Gaming'},
            { name: 'Clothing'}
        ];

        let cat1 = await db.query(catQuery, [cats[0].name]);
        let cat2 = await db.query(catQuery, [cats[1].name]);
        let cat3 = await db.query(catQuery, [cats[2].name]);
        let cat4 = await db.query(catQuery, [cats[3].name]);

         // Add some products
         const prodQuery = "INSERT INTO products(name, description, price) VALUES($1, $2, $3) RETURNING product_id;";

        const prods = [
            { name: 'The art of coding', description: 'Book 1 in a series of 200', price: 15.99},
            { name: 'Dad jokes for the ages', description: 'A dad joke for every occassion', price: 9.99},
            { name: 'Suckmaster Leaf Blower', description: 'Sucks better than anything you have experienced', price: 249.99},
            { name: 'Grass seed', description: 'Have your lawn always be the grass that is greener', price: 4.99},
            { name: 'Dodge Gaming Wheel', description: 'Best in the business to make you go vroom vroom ', price: 99.99},
            { name: 'Bilge Waters', description: 'A tabletop pirate adventure for 1 to 5 players', price: 39.99},
            { name: 'Pink Fluffy Socks', description: 'So fluffy', price: 9.99},
            { name: 'Green Turtle Neck Sweater', description: 'Comes in blue and red as well', price: 35.99},
        ];

        const prod1 = await db.query(prodQuery, [prods[0].name, prods[0].description,prods[0].price]);
        const prod2 = await db.query(prodQuery, [prods[1].name, prods[1].description,prods[1].price]);
        const prod3 = await db.query(prodQuery, [prods[2].name, prods[2].description,prods[2].price]);
        const prod4 = await db.query(prodQuery, [prods[3].name, prods[3].description,prods[3].price]);
        const prod5 = await db.query(prodQuery, [prods[4].name, prods[4].description,prods[4].price]);
        const prod6 = await db.query(prodQuery, [prods[5].name, prods[5].description,prods[5].price]);
        const prod7 = await db.query(prodQuery, [prods[6].name, prods[6].description,prods[6].price]);
        const prod8 = await db.query(prodQuery, [prods[7].name, prods[7].description,prods[7].price]);

        // Product Categories
        const prodCatQuery = "INSERT INTO products_categories(product_id, category_id) VALUES($1, $2);";
        
        await db.query(prodCatQuery,[prod1.rows[0].product_id, cat1.rows[0].category_id]);
        await db.query(prodCatQuery,[prod2.rows[0].product_id, cat1.rows[0].category_id]);
        await db.query(prodCatQuery,[prod3.rows[0].product_id, cat2.rows[0].category_id]);
        await db.query(prodCatQuery,[prod4.rows[0].product_id, cat2.rows[0].category_id]);
        await db.query(prodCatQuery,[prod5.rows[0].product_id, cat3.rows[0].category_id]);
        await db.query(prodCatQuery,[prod6.rows[0].product_id, cat3.rows[0].category_id]);
        await db.query(prodCatQuery,[prod7.rows[0].product_id, cat4.rows[0].category_id]);
        await db.query(prodCatQuery,[prod8.rows[0].product_id, cat4.rows[0].category_id]);

        // Orders
        const orderQuery = "INSERT INTO orders(user_id, order_date, order_paid_for, order_total_cost) VALUES($1, $2, $3, $4) RETURNING order_id;";

        const order1 = await db.query(orderQuery, [custId, '2022-01-01 12:15:46', false, 15.99]); // prod 1
        order2 = await db.query(orderQuery, [custId, '2021-11-15 03:30:21', false, 135.98]); // prod 5, 8
        const order3 = await db.query(orderQuery, [custId, '2022-01-10 15:06:56', false, 254.98]); // prod 
        
        // Order Products
        const orderProdQuery = "INSERT INTO orders_products(order_id, product_id, quantity) VALUES($1, $2, $3);";

        await db.query(orderProdQuery, [order1.rows[0].order_id, prod1.rows[0].product_id, 1]);
        await db.query(orderProdQuery, [order2.rows[0].order_id, prod5.rows[0].product_id, 1]);
        await db.query(orderProdQuery, [order2.rows[0].order_id, prod8.rows[0].product_id, 1]);
        await db.query(orderProdQuery, [order3.rows[0].order_id, prod3.rows[0].product_id, 1]);
        await db.query(orderProdQuery, [order3.rows[0].order_id, prod4.rows[0].product_id, 1]);

    });

    afterAll( async () => {

        // Remove the order_products table
        await db.query('DELETE FROM orders_products;','');

        // Remove the products
        await db.query('DELETE FROM orders;','');

        // Remove product categories
        await db.query('DELETE FROM products_categories;');

        // Remove from products
        await db.query('DELETE FROM products;');

        // Remove the categories
        await db.query('DELETE FROM categories');

        // Remove any data created for the tests
        await db.query('DELETE FROM users WHERE email = $1;',['admin@ecommerceshop.com']);
        await db.query('DELETE FROM users WHERE email = $1;', ['customer@ecommerceshop.com']);
        await db.query('DELETE FROM users WHERE email = $1;',['jbloom@derision.net']);

        // End the pool so JEST does not hang at the end
        await db.pool.end();

    });

    describe('POST /users', () => {

        it('creates a user with status 201 for authorized user', async () => {


            // Generate the data we wish to send through
            const postData = {
                email: 'jbloom@derision.net',
                password: 'fullbl00m',
                forename: 'Janet',
                surname: 'Bloom',
                contact_number: '04634 749352',
                roles: 'Customer'
            }

            // Access the route
            const response = await request(app)
              .post('/users')
              .query({ secret_token: adminToken})
              .type('application/json')
              .set('Accept', 'application.json')
              .send(postData)

            // Check the response
            expect(response.statusCode).toBe(201);
            
            // Check the user returned
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body[0].user_id).toBeDefined();

            // Get a user ID to use in later tests
            userId = response.body[0].user_id;

        });

        it('returns status 401 if a non admin tries to create a user', async () => {

            // Generate the data we wish to send through
            const postData = {
                email: 'jbloom@derision.net',
                password: 'fullbl00m',
                forename: 'Janet',
                surname: 'Bloom',
                contact_number: '04634 749352',
                roles: 'Customer'
            }

            // Access the route
            const response = await request(app)
              .post('/users')
              .query({ secret_token: custToken})
              .type('application/json')
              .set('Accept', 'application.json')
              .send(postData)

            // Check the response
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toEqual('You do not have access to this resource.');

        });

        it('returns status 400 when the users already exists', async () => {

          // Generate the data we wish to send through
            const postData = {
                email: 'jbloom@derision.net',
                password: 'fullbl00m',
                forename: 'Janet',
                surname: 'Bloom',
                contact_number: '04634 749352',
                roles: 'Customer'
            }

            // Access the route
            const response = await request(app)
            .post('/users')
            .query({ secret_token: adminToken})
            .type('application/json')
            .set('Accept', 'application.json')
            .send(postData)  

            // Check the response
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toEqual('Unable to process record as uniqueness rules were violated.');

        });

        it('returns status 404 when wrong/incorrect number of columns sent', async () => {

           // Generate the data we wish to send through
           const postData = {
            password: 'fullbl00m',
            forename: 'Janet',
            surname: 'Bloom',
            contact_number: '04634 749352',
            roles: 'Customer'
        }

        // Access the route
        const response = await request(app)
        .post('/users')
        .query({ secret_token: adminToken})
        .type('application/json')
        .set('Accept', 'application.json')
        .send(postData)  

        // Check the response
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toEqual('One or more values are missing from the request');

        });

    });

    describe('GET /users', () => {

        it('retrieves all users as an array and has status 200', async () => {

            // Access the route
            const response = await request(app)
              .get('/users')
              .query({secret_token: adminToken})

            // Check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(3);

        });

    });

    describe('GET /users/:userid', () => {

        it('retrieves the specified user with status 200', async () => {
            
            // Access the route
            const response = await request(app)
              .get(`/users/${userId}`)
              .query({ secret_token: custToken})

            // Check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(1);

        });

        it('fails with status 400 with incorrect data', async () => {

            // Access the route
            const response = await request(app)
              .get(`/users/twelve`)
              .query({ secret_token: custToken})

            // Check the response
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toEqual('The URI parameter is not of the expected format');

        });

    });

    describe('PUT /users', () => {

        it('updates a user', async () => {

            // Generate the put data
            const putData = {
                "table_key_col": "user_id",
                data: [
                    { "column": "password", "value": bcrypt.hash("funkymonkey", 10)}
                ]
            }

            // Access the route
            const response = await request(app)
              .put(`/users/${userId}`)
              .type('application/json')
              .set('Accept', 'application/json')
              .query({ secret_token: adminToken })
              .send(putData)

            // Check the response
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toEqual(`Record ${userId} updated successfully`);

        });

    });

    describe('DELETE /users/:userid', () => {

        it('removes the user and returns status 200', async () => {

            // Access the route
            const response = await request(app)
             .delete(`/users/${userId}`)
             .query({ secret_token: adminToken })

            // Check the response
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toEqual(`Record #${userId} deleted`)

        });

        it('only gets two users after deletion', async () => {

            // Access the route
            const response = await request(app)
             .get('/users')
             .query({ secret_token:  adminToken });

            // Check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(2);

        });

        it('no longer finds the user deleted', async () => {

            // Access the route
            const response = await request(app)
              .get(`/users/${userId}`)
              .query({ secret_token: adminToken })

            // Check the response
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toEqual('No records were found with the specified parameters');

        });

    });

    describe('GET to /users/:userid/orders', () => {

        it('returns the specified users 3 orders and status 200', async () => {

            // Access the route
            const response = await request(app)
             .get(`/users/${custId}/orders`)
             .query({ secret_token: custToken })
            
            // Check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(3);

        });

        it('returns status 404 if no orders have been found', async () => {

            // Access the route
            const response = await request(app)
              .get('/users/12/orders')
              .query({ secret_token: custToken })

            // Check the response
            expect(response.statusCode).toBe(404);
            
        });



    });

    describe('GET /users/:userid/orders/:orderid', () => {

        it('returns the specifed order and status 200', async () => {

            // Access the route
            const response = await request(app)
              .get(`/users/${custId}/orders/${order2.rows[0].order_id}`)
              .query({ secret_token: custToken })

            // Check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(1);

        });

        it('returns status 404 if order is not found', async () => {

            // Access the route
            const response = await request(app)
             .get(`/users/${custId}/orders/1`)
             .query({ secret_token: custToken })

           // Check the response
           expect(response.statusCode).toBe(404);
        });

    });

});