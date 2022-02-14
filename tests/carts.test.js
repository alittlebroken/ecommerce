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
let custId, custToken, cartId;
let order1, order2, order3;
let prod1, prod2, prod3, prod4, prod5, prod6, preod7, prod8;

// Setup and Teardown methods
beforeAll( async () => {

    // Create the admin user
    const adminUserModel = new userModel({
        email: 'admin3@ecommerce.com',
        password: 'adm1n1st4t0r!8765',
        roles: 'Admin'
    });

    const adminUser = await adminUserModel.create();
    adminId = adminUser.user_id;

    // Get the token
    const adminResponse = await request(app)
     .post('/auth/login')
     .type('application/json')
     .set('Accept','application/json')
     .send({ email: 'admin3@ecommerce.com', password: 'adm1n1st4t0r!8765' })
    
    adminToken = adminResponse.body.token;

    // Create a user for the customer
    const customerUserModel = new userModel({
        email: 'customer3@ecommerce.com',
        password: 'cust0-m3r1sr1ght',
        roles: 'Customer'
    });

    const customerUser = await customerUserModel.create();
    custId = customerUser.user_id;

    // Get the token
    const customerResponse = await request(app)
     .post('/auth/login')
     .type('application/json')
     .set('Accept','application/json')
     .send({ email: 'customer3@ecommerce.com', password: 'cust0-m3r1sr1ght' })
    
    customerToken = customerResponse.body.token;

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

      prod1 = await db.query(prodQuery, [prods[0].name, prods[0].description,prods[0].price]);
      prod2 = await db.query(prodQuery, [prods[1].name, prods[1].description,prods[1].price]);
      prod3 = await db.query(prodQuery, [prods[2].name, prods[2].description,prods[2].price]);
      prod4 = await db.query(prodQuery, [prods[3].name, prods[3].description,prods[3].price]);
      prod5 = await db.query(prodQuery, [prods[4].name, prods[4].description,prods[4].price]);
      prod6 = await db.query(prodQuery, [prods[5].name, prods[5].description,prods[5].price]);
      prod7 = await db.query(prodQuery, [prods[6].name, prods[6].description,prods[6].price]);
      prod8 = await db.query(prodQuery, [prods[7].name, prods[7].description,prods[7].price]);

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

      order1 = await db.query(orderQuery, [custId, '2022-01-01 12:15:46', false, 15.99]); // prod 1
      order2 = await db.query(orderQuery, [custId, '2021-11-15 03:30:21', false, 135.98]); // prod 5, 8
      order3 = await db.query(orderQuery, [custId, '2022-01-10 15:06:56', false, 254.98]); // prod 
      
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

    // Remove the carts
    await db.query('DELETE FROM carts');
    await db.query('DELETE FROM carts_products');

    // Deletes the users created
    await db.query('DELETE FROM users WHERE email = $1;', ['admin3@ecommerce.com']);
    await db.query('DELETE FROM users WHERE email = $1;', ['customer3@ecommerce.com']);
    

    // End the pool connections
    await db.pool.end();

});

describe('Carts', () => {

    describe('POST /carts', () => {

        it('creates a cart for the user', async () => {

            // Generate data to send
            const putData = {
                "userId": custId
            }

            // Access the route
            const response = await request(app)
              .post(`/carts`)
              .query({ secret_token: adminToken })
              .type('application/json')
              .set('Accept', 'Application')
              .send(putData)

            // Check the response
            expect(response.statusCode).toBe(201);

            // Assign the cartId for use later in the test suite
            cartId = response.body.cart_id;

        });

        it('returns 401 if the route is accessed by an unauthorized account', async () => {

            // Generate data to send
            const putData = {
                "userId": custId
            }

            // Access the route
            const response = await request(app)
              .post(`/carts`)
              .type('application/json')
              .set('Accept', 'Application')
              .send(putData)

            // Check the response
            expect(response.statusCode).toBe(401);

        });

        it('returns 404 with missing/incorrect data sent to route', async () => {

            // Generate data to send
            const putData = {
                "userId": ''
            }

            // Access the route
            const response = await request(app)
              .post(`/carts`)
              .query({ secret_token: adminToken })
              .type('application/json')
              .set('Accept', 'Application')
              .send(putData)

            // Check the response
            expect(response.statusCode).toBe(404);

        });

        it('returns 400 if the cart being created already exists', async () => {

            // Generate data to send
            const putData = {
                "userId": custId
            }

            // Access the route
            const response = await request(app)
              .post(`/carts`)
              .query({ secret_token: adminToken })
              .type('application/json')
              .set('Accept', 'Application')
              .send(putData)

            // Check the response
            expect(response.statusCode).toBe(400);

        });

    });

    describe('POST /carts/:cartid', () => {

        it('adds an item to the cart', async () => {

            // Generate the data to add to the cart
            const postData = {
                "items": [{
                    "productId": prod6.rows[0].product_id
                }]
            }

            // Access the route
            const response = await request(app)
             .post(`/carts/${cartId}`)
             .query({ secret_token: adminToken })
             .type('application/json')
             .set('Accept', 'application/json')
             .send(postData)

            // Check the response
            expect(response.statusCode).toBe(201);

            // Add a second item

            // Generate the data to add to the cart
            const postDataTwo = {
                "items": [{
                    "productId": prod1.rows[0].product_id
                }]
            }

            // Access the route
            const responseTwo = await request(app)
             .post(`/carts/${cartId}`)
             .query({ secret_token: adminToken })
             .type('application/json')
             .set('Accept', 'application/json')
             .send(postDataTwo)

            // Check the response
            expect(responseTwo.statusCode).toBe(201);

        });

        it('returns status 401 if an unauthorized user tries to access the route', async () => {

            // Generate the data to add to the cart
            const postData = {
                "items": [{
                    "productId": prod6.rows[0].product_id
                }]
            }

            // Access the route
            const response = await request(app)
             .post(`/carts/${cartId}`)
             .type('application/json')
             .set('Accept', 'application/json')
             .send(postData)


            // Check the response
            expect(response.statusCode).toBe(401);

        });

        it('returns status 404 if request data is missing', async () => {

            // Access the route
            const response = await request(app)
             .post(`/carts/${cartId}`)
             .query({ secret_token: adminToken })
             .type('application/json')
             .set('Accept', 'application/json')
             .send()

            // Check the response
            expect(response.statusCode).toBe(404);

        });

    });

    describe('GET /carts', () => {

        it('retrieves all carts', async () => {

            const response = await request(app)
              .get(`/carts`)
              .query({ secret_token: adminToken })

            // check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(1);

        });

        it('returns status 401 if route is accessed by an unauthorized user', async () => {

            const response = await request(app)
              .get(`/carts`)

            // check the response
            expect(response.statusCode).toBe(401);

        });

    });

    describe('GET /carts/:cartId', () => {

        it('returns items in the specified cart', async () => {

            // Access the route
            const response = await request(app)
              .get(`/carts/${cartId}`)
              .query({ secret_token: adminToken })

            // check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(2);

        });

        it('returns status 401 if the route is accessed by an anauthorized user', async () => {

            // Access the route
            const response = await request(app)
              .get(`/carts/${cartId}`)

            // check the response
            expect(response.statusCode).toBe(401);

        });

        it('returns status 404 if the cart accessed does not exist', async () => {

            // Access the route
            const response = await request(app)
              .get(`/carts/${64837625}`)
              .query({ secret_token: adminToken })

            // check the response
            expect(response.statusCode).toBe(404);

        });

    });

    describe('PUT /carts/:cartid/items/:itemid', () => {

        it('updates the item in the cart', async () => {

            // Generate the update data
            const putData = {
                quantity: 2
            }

            // Get the supporting info to make the route work
            const product_id = prod6.rows[0].product_id;
            const cart_id = cartId;

            // Access the route with ther provided information
            const response = await request(app)
             .put(`/carts/${cart_id}/items/${product_id}`)
             .query({ secret_token: adminToken })
             .type('application/json')
             .set('Accept', 'application/json')
             .send(putData)

            // Check the response
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toEqual(1);
            expect(response.body[0].cart_id).toEqual(cart_id);
            expect(response.body[0].product_id).toEqual(product_id);
            expect(response.body[0].quantity).toEqual(putData.quantity);

        });

        it('returns 401 if an unauthorized users tries to use the route', async () => {

            // Generate the update data
            const putData = {
                quantity: 2
            }

            // Get the supporting info to make the route work
            const product_id = prod6.rows[0].product_id;
            const cart_id = cartId;

            // Access the route with ther provided information
            const response = await request(app)
             .put(`/carts/${cart_id}/items/${product_id}`)
             .type('application/json')
             .set('Accept', 'application/json')
             .send(putData)

            // Check the response
            expect(response.statusCode).toBe(401);

        });

        it('removes the item if quantity set to 0', async () => {

            // Generate the update data
            const putData = {
                quantity: 0
            }

            // Get the supporting info to make the route work
            const product_id = prod6.rows[0].product_id;
            const cart_id = cartId;

            // Access the route with ther provided information
            const response = await request(app)
             .put(`/carts/${cart_id}/items/${product_id}`)
             .query({ secret_token: adminToken })
             .type('application/json')
             .set('Accept', 'application/json')
             .send(putData)

            // Check the response
            expect(response.statusCode).toBe(200);

            // Check it no longer exists
            const getResponse = await request(app)
              .get(`/carts/${cart_id}/items/${product_id}`)
              .query({ secret_token: adminToken })

            // Check the response
            expect(getResponse.statusCode).toBe(404);

        });

        it('returns 404 with missing or incorrect information', async () => {

            // Generate the update data
            const putData = {
                
            }

            // Get the supporting info to make the route work
            const product_id = prod6.rows[0].product_id;
            const cart_id = cartId;

            // Access the route with ther provided information
            const response = await request(app)
             .put(`/carts/${cart_id}/items/${product_id}`)
             .query({ secret_token: adminToken })
             .type('application/json')
             .set('Accept', 'application/json')
             .send(putData)

            // Check the response
            expect(response.statusCode).toBe(404);

        });

    });


    describe('DELETE /carts/:cartid', () => {

        it('empties the cart', async () => {

            // Access the route
            const response = await request(app)
              .delete(`/carts/${cartId}`)
              .query({ secret_token: adminToken })

            // Check the response
            expect(response.statusCode).toBe(200);

            // Now check the cart has zero items
            const getResponse = await request(app)
             .get(`/carts/${cartId}`)
             .query({ secret_token: adminToken })

            // Check the response
            expect(getResponse.statusCode).toBe(404);

        });

        it('returns 401 if accessed by an unauthorized user', async () => {

            // Access the route
            const response = await request(app)
              .delete(`/carts/${cartId}`)

            // Check the response
            expect(response.statusCode).toBe(401);


        });

        it('returns 404 if information is missing or incorrect', async () => {

            // Access the route
            const response = await request(app)
              .delete(`/carts/${cartId}`)
              .query({ secret_token: adminToken })

            // Check the response
            expect(response.statusCode).toBe(404);

        });


    });

});