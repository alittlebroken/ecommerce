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
        email: 'admin4@ecommerce.com',
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
     .send({ email: 'admin4@ecommerce.com', password: 'adm1n1st4t0r!8765' })
    
    adminToken = adminResponse.body.token;

    // Create a user for the customer
    const customerUserModel = new userModel({
        email: 'customer4@ecommerce.com',
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
     .send({ email: 'customer4@ecommerce.com', password: 'cust0-m3r1sr1ght' })
    
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

      // Create a cart for the user
      const cartQuery = `INSERT INTO carts(user_id) VALUES($1) RETURNING cart_id;`;
      const cartValues = [custId];
      cartId = await db.query(cartQuery, cartValues);

      // Add some items to the cart
      const cartItemQuery = `INSERT INTO carts_products(cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *;`;

      const cartItem1 = await db.query(cartItemQuery, [cartId.rows[0].cart_id, prod7.rows[0].product_id, 1]);
      const cartItem2 = await db.query(cartItemQuery, [cartId.rows[0].cart_id, prod4.rows[0].product_id, 2]);
      const cartItem3 = await db.query(cartItemQuery, [cartId.rows[0].cart_id, prod8.rows[0].product_id, 1]);

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
    await db.query('DELETE FROM users WHERE email = $1;', ['admin4@ecommerce.com']);
    await db.query('DELETE FROM users WHERE email = $1;', ['customer4@ecommerce.com']);
    

    // End the pool connections
    await db.pool.end();

});

describe('Checkout', () => {

    describe('POST /checkout/cartid', () => {

        it('creates a checkout session and sends back a stripe payment url', async () => {

            // Set the cartId to checkout
            const cart_id = cartId.rows[0].cart_id;

            // Access the route
            const response = await request(app)
             .post(`/checkout/${cart_id}`)
             .query({ secret_token: adminToken })
             .type('application/json')
             .set('Accept', 'application/json')
             .send()

            // Check the response
            expect(response.statusCode).toBe(200);
            expect(response.body.url).toBeTruthy();

            /*
                Add more tests here to ensure the checkout portion worked
            */

        });

        it('returns 401 if an unathorized user tries to access the url', async () => {

             // Set the cartId to checkout
             const cart_id = cartId.rows[0].cart_id;

             // Access the route
             const response = await request(app)
              .post(`/checkout/${cart_id}`)
              .type('application/json')
              .set('Accept', 'application/json')
              .send()
 
             // Check the response
             expect(response.statusCode).toBe(401);

        });

        it('returns 404 if the required cart is missing or incorrect', async () => {

             // Set the cartId to checkout
             const cart_id = 94783652;

             // Access the route
             const response = await request(app)
              .post(`/checkout/${cart_id}`)
              .query({ secret_token: adminToken })
              .type('application/json')
              .set('Accept', 'application/json')
              .send()
 
             // Check the response
             expect(response.statusCode).toBe(404);

        });

    });

});