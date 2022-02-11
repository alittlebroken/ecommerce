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
const userModel = require('../models/user')
const productModel = require('../models/products')
const cartModel = require('../models/carts.js')
const orderModel = require('../models/order.js')

// Vars needed across all tests
let adminId, adminToken;
let custId, custToken;
let productId;

// Setup and Teardown methods
beforeAll( async () => {

    // Create the admin user
    const adminUserModel = new userModel({
        email: 'admin1@ecommerce.com',
        password: 'adm1n1st4t0r!8765',
        roles: 'Admin'
    });

    const adminUser = await adminUserModel.create();
    adminId = adminUser.id;

    // Get the token
    const adminResponse = await request(app)
     .post('/auth/login')
     .type('application/json')
     .set('Accept','application/json')
     .send({ email: 'admin1@ecommerce.com', password: 'adm1n1st4t0r!8765' })
    
    adminToken = adminResponse.body.token;

    // Create a user for the customer
    const customerUserModel = new userModel({
        email: 'customer1@ecommerce.com',
        password: 'cust0-m3r1sr1ght',
        roles: 'Customer'
    });

    const customerUser = await customerUserModel.create();
    custId = customerUser.id;

    // Get the token
    const customerResponse = await request(app)
     .post('/auth/login')
     .type('application/json')
     .set('Accept','application/json')
     .send({ email: 'customer1@ecommerce.com', password: 'cust0-m3r1sr1ght' })
    
    customerToken = customerResponse.body.token;

});

afterAll( async () => {

    // Delete any added products
    await db.query('DELETE FROM products WHERE name = $1;', ['Iron Man 4: Iron Harder']);

    // Deletes the users created
    await db.query('DELETE FROM users WHERE email = $1;', ['admin1@ecommerce.com']);
    await db.query('DELETE FROM users WHERE email = $1;', ['customer1@ecommerce.com']);

    // End the pool connections
    await db.pool.end();

});

describe('Products', () => {

    describe('POST /products', () => {

        it('creates a product returns status 201', async () => { 

            // Generate a product to add
            const postData = {
                name: 'Iron Man 4: Iron Harder',
                description: 'Iron Man faces off against his toughest opponent, household chores.',
                price: 15.99,
                image_url: null,
                in_stock: true
            };

            // Access the route
            const response = await request(app)
              .post('/products')
              .query({ secret_token: adminToken })
              .type('application/json')
              .set('Accept','application/json')
              .send(postData)

            // Check the response
            expect(response.statusCode).toBe(201);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(1);

            // Assign the product ID to be used for later testing
            productId = response.body[0].product_id;

        });

        it('returns 401 if an unathorized users tries to create a product', async () => {

            // Generate a product to add
            const postData = {
                name: 'Iron Man 5: A good day to iron hard',
                description: "Tony's biggest challenge yet. Dress shirts",
                price: 12.99,
                image_url: null,
                in_stock: true
            }

            // Access the route
            const response = await request(app)
              .post('/products')
              .type('application/json')
              .set('Accept','application/json')
              .send(postData)

            // Check the response
            expect(response.statusCode).toBe(401);
            

        });

        it('returns status 404 when sent with no data', async () => {

            // Access the route
            const response = await request(app)
              .post('/products')
              .query({ secret_token: adminToken })
              .type('application/json')
              .set('Accept','application/json')
              .send({})

            // Check the response
            expect(response.statusCode).toBe(404);

        });

        it('returns status 400 when sent with incorrect data', async () => {

            // Generate a product to add
            const postData = {
                name: 'Iron Man 5: A good day to iron hard',
                description: "Tony's biggest challenge yet. Dress shirts",
                price: "tweve pounds fifty pence",
                image_url: null,
                in_stock: true
            }

            // Access the route
            const response = await request(app)
              .post('/products')
              .query({ secret_token: adminToken })
              .type('application/json')
              .set('Accept','application/json')
              .send(postData)

            // Check the response
            expect(response.statusCode).toBe(400);
            
        });

    });

    describe('GET /products', () => {

        it('returns a list of products in the DB and status 200', async () => {

            // Access the route
            const response = await request(app)
             .get('/products')
             .query({ secret_token: adminToken })

            // Check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(1);

        });

    });

    describe('GET /products/:productId', () => {

        it('returns the product with status 200', async () => {

            // Access the route
            const response = await request(app)
            .get(`/products/${productId}`)

            // Check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(1);

        });

        it('returns status 404 when the product is not found', async () => {

            // Access the route
            const response = await request(app)
            .get(`/products/${'-'}`)

            // Check the response
            expect(response.statusCode).toBe(404);

        });

    });

    describe('PUT /products/:productId', () => {

        it('updates the product and returns status 200', async () => {

            // Generate the data to be updated
            const putData = {
                "name": "Iron Man 4: Iron Harder",
                "description": "Iron Man faces off against his toughest opponent, household chores.",
                "price": 9.99,
                "image_url": null,
                "in_stock": false
            };

            // Access the route
            const response = await request(app)
              .put(`/products/${productId}`)
              .query({ secret_token: adminToken })
              .type('application/json')
              .set('Accept', 'application/json')
              .send(putData)


            // Check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(1);

            expect(response.body[0].product_id).toEqual(productId);
            expect(response.body[0].name).toEqual(putData.name);
            expect(response.body[0].description).toEqual(putData.description);
            expect(parseFloat(response.body[0].price)).toEqual(putData.price);
            expect(response.body[0].image_url).toEqual(putData.image_url);
            expect(response.body[0].in_stock).toEqual(putData.in_stock);

        });

        it('returns 401 if not logged in before updating', async () => {

            // Generate the data to be updated
            const putData = {
                "name": "Iron Man 4: Iron Harder",
                "description": "Iron Man faces off against his toughest opponent, household chores.",
                "price": 9.99,
                "image_url": null,
                "in_stock": false
            };

            // Access the route
            const response = await request(app)
              .put(`/products/${productId}`)
              .type('application/json')
              .set('Accept', 'application/json')
              .send(putData)


            // Check the response
            expect(response.statusCode).toBe(401);

        });

        it('returns 404 if the product is not found', async () => {

            // Now set the data to be updated
            const putData = {
                "name": "Iron Man 4: Iron Harder",
                "description": "Iron Man faces off against his toughest opponent, household chores.",
                "price": 13.99,
                "image_url": null,
                "in_stock": false
            };

            // Access the route with a non existant ID
            const response = await request(app)
              .put(`/products/${1}`)
              .query({ secret_token: adminToken })
              .type('application/json')
              .set('Accept', 'application/json')
              .send(putData)


            // Check the response
            expect(response.statusCode).toBe(404);

        });

    });
    
    describe('DELETE /products/:productId', () => {

        it('deletes a product with status 201', async () => {

            // Access the route
            const response = await request(app)
             .delete(`/products/${productId}`)
             .query({ secret_token: adminToken })

            // Check the response
            expect(response.statusCode).toBe(201);

            // Check if the deleted item shows up still
            const checkIfDeleted = await request(app)
             .get(`/products/${productId}`)
            
             expect(checkIfDeleted.statusCode).toBe(404);

        });

        it('returns 401 when an unauthorized user tries to access route', async () => {

            // Access the route
            const response = await request(app)
             .delete(`/products/${productId}`)

            // Check the response
            expect(response.statusCode).toBe(401);

        });

    });

});