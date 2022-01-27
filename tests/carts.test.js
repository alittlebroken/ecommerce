const chai = require('chai')
const chai_http = require('chai-http')
const assert = chai.assert
const app = require ('../app')

const db = require('../db/db')

// require any helper models
const userModel = require('../models/user')
const cartModel = require('../models/carts')
const productModel = require('../models/products')

// Add plugins for chai
chai.use(chai_http)

describe('CARTS', () => {

    describe('POST to /carts', () => {

        it('Creates a cart for the user, returns cart id and status 201', async () => {
            
            // generate the data to be sent
            const rows = await db.query("SELECT user_id FROM users WHERE email = $1;", ['littleted@ursine.com']);

            const data = {
                "userId": rows.rows[0].user_id
            };

            chai.request(app)
             .post('/carts')
             .type('application.json')
             .set('Accept', 'application/json')
             .send(data)
             .end((err, res) => {
                 if(err) done(err);
                 
                 assert.equal(res.statusCode, 201);
                 assert.isNotEmpty(res.body);
                 assert.isNumber(res.body.cart_id);
                 
             })
        });

        it('returns status 400 when trying to create a cart that already exists', async () => {

            // generate the data to be sent
            const rows = await db.query("SELECT user_id FROM users WHERE email = $1;", ['littleted@ursine.com']);

            const data = {
                "userId": rows.rows[0].user_id
            };

            // Send the data and test the result
            chai.request(app)
             .post('/carts')
             .type('application/json')
             .set('Accept', 'application/json')
             .send(data)
             .end((err, res) => {
                 if(err) done(err);
                                 
                 assert.equal(res.statusCode, 400);
                
             })

        });

        it('returns 404 when no infomation is supplied with request', async () => {

            // Send the data and test the rsult
            chai.request(app)
             .post('/carts')
             .type('application/json')
             .set('Accept', 'application/json')
             .send()
             .end((err, res) => {
                 if(err) done(err);
                 
                 assert.equal(res.statusCode, 404);
                 
             })

        });

    });

    describe('POST to /carts/:cartid', () => {

        it('Adds an item to the cart and returns 201', async () => {

            // Get the cart for the user
            const userData = await db.query("SELECT user_id FROM users WHERE email = $1;", ['littleted@ursine.com']);
            const cartData = await db.query("SELECT cart_id FROM carts WHERE user_id = $1;", [userData.rows[0].user_id]);
            const prodData = await db.query("SELECT product_id FROM products where name = $1;", ['Bilge Waters']);

            // Create the payload to send
            const data = {
                "items": [{
                    "productId": prodData.rows[0].product_id,
                }]
            };

            // Send the data and check the result
            chai.request(app)
             .post(`/carts/${cartData.rows[0].cart_id}`)
             .type('application/json')
             .set('Accept', 'application/json')
             .send(data)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 201);
             })

        });

        it('returns 404 if request data is missing', async () => {

            /// POST to the route and check the result back
            chai.request(app)
             .post('/carts/1')
             .type('application/json')
             .set('Accept', 'application/json')
             .send()
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);

             })

        });

    });

    describe('GET to /carts', () => {

        it('returns all carts with status of 200', async () => {

            // GET to the route and check the result
            chai.request(app)
             .get('/carts')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 200);
                 assert.isArray(res.body);
                 assert.equal(res.body.length, 4);
                 
             })

        });

    });

    describe ('GET to /carts/:cartid', () => {

        it('returns a valid cart and contents and status 200', async () => {

            // Query to get a valid cart ID from the DB
            const query = "SELECT c.cart_id FROM carts c INNER JOIN users u ON c.user_id = u.user_id WHERE email = $1;";

            // Values to use with the query
            const values = ['dingle@gherts.com'];

            // Run the query to get the data we need for the test
            const response = await db.query(query, values);
            
            // get the cart id
            const cart_id = response.rows[0].cart_id;

            // Run the test and check the result
            chai.request(app)
             .get(`/carts/${cart_id}`)
             .end((err, res) => {
                 if(err) done(err);
                 
                 assert.equal(res.statusCode, 200);
                 assert.isArray(res.body);
                 assert.equal(res.body.length, 4);
                 
             })

        });

        it('returns 404 if the cart is not found', async () => {

            // Run the testand check the result
            chai.request(app)
             .get('/carts/1')
             .end((err, res) => {
                 if(err) done(err);
                 
                 assert.equal(res.statusCode, 404);
                 
             })

        });

    });

    describe('PUT to /carts/:cartid/items/:itemid', () => {

        it('update item and returns status 200 and updated list item', async () => {

            // Data to update in cart
            const data = {
                quantity: 2
            };

            // Get the user we wish to use for the test
            let userData;
            try{
                userData = await userModel.findByEmail('dingle@gherts.com');
            } catch(err) {
                throw new Error(err);
            }

            // Get the cart ID for the user we have chosen for this test
            let cartData;
            try{
                cartData = await cartModel.findByUser(userData.user_id);
            } catch(err) {
                throw new Error(err);
            }

            // Get an item to update
            let itemData;
            try{
                itemData = await productModel.findByName({ name: 'Bilge Waters' });
            } catch(err) {
                throw new Error(err);
            }

            // Run the test and check the result
            chai.request(app)
             .put(`/carts/${cartData.cart_id}/items/${itemData.product_id}`)
             .type('application/json')
             .set('Accept', 'application.json')
             .send(data)
             .end((err, res) => {
                if(err) done(err);
                 
                 assert.equal(res.statusCode, 200);
                 assert.equal(res.body.cart_id, cartData.cart_id);
                 assert.equal(res.body.product_id, itemData.product_id);
                 assert.equal(res.body.quantity, 2);
             });

        });

        it('removes an item from the cart if quantity is set to 0', async () => {

            // Data to update in cart
            const data = {
                quantity: 0
            };

            // Get the user we wish to use for the test
            let userData;
            try{
                userData = await userModel.findByEmail('dingle@gherts.com');
            } catch(err) {
                throw new Error(err);
            }

            // Get the cart ID for the user we have chosen for this test
            let cartData;
            try{
                cartData = await cartModel.findByUser(userData.user_id);
            } catch(err) {
                throw new Error(err);
            }

            // Get an item to update
            let itemData;
            try{
                itemData = await productModel.findByName({ name: 'Bilge Waters' });
            } catch(err) {
                throw new Error(err);
            }

            
            // Run the test and check the result
            chai.request(app)
             .put(`/carts/${cartData.cart_id}/items/${itemData.product_id}`)
             .type('application/json')
             .set('Accept', 'application.json')
             .send(data)
             .end((err, res) => {
                 if(err) done(err);
                 
                 assert.equal(res.statusCode, 200);
                 assert.equal(res.body.cart_id, cartData.cart_id);
                 assert.equal(res.body.product_id, itemData.product_id);
             });

             // Now check the item has gone from the cart
             chai.request(app)
              .get(`/carts/${cartData.cart_id}`)
              .end((err, res) => {
                if(err) done(err);
                
                assert.equal(res.statusCode, 200);
                assert.isArray(res.body);
                assert.equal(res.body.length, 3);
              });

        });

        it('returns 404 with missing or incorrect information', async () => {

            // Run the test and check the result
            chai.request(app)
             .put('/carts/1/items/1')
             .type('application/json')
             .set('Accept', 'application/json')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
                 
             })

        });

    });

    describe('DELETE to /carts/:cartid', () => {

        it('empties cart and returns status 200', async () => {

            // Get the user we wish to use for the test
            let userData;
            try{
                userData = await userModel.findByEmail('sfringle@corpbuster.com');
            } catch(err) {
                throw new Error(err);
            }

            // Get the cart ID for the user we have chosen for this test
            let cartData;
            try{
                cartData = await cartModel.findByUser(userData.user_id);
            } catch(err) {
                throw new Error(err);
            }


            // run the test and check the results
            chai.request(app)
             .delete(`/carts/${cartData.cart_id}`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 200);
             });

             // check that the specified user now has zero cart items
             chai.request(app)
              .get(`/carts/${cartData.cart_id}`)
              .end((err, res) => {
                  if(err) done(err);

                  assert.equal(res.statusCode, 404);
              });

        });

        it('returns 404 if information is missing or incorrect', async () => {

            // Get the user we wish to use for the test
            let userData;
            try{
                userData = await userModel.findByEmail('sfringle@corpbuster.com');
            } catch(err) {
                throw new Error(err);
            }

            // Get the cart ID for the user we have chosen for this test
            let cartData;
            try{
                cartData = await cartModel.findByUser(userData.user_id);
            } catch(err) {
                throw new Error(err);
            }

            // Run the test and check results
            chai.request(app)
             .delete(`/carts/${cartData.cart_id}`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
                 
             })

        });

    });

    describe('DELETE to /carts/:cartid/items/:itemid', () => {

        it('removes item and returns status 200' , async () => {

            // Get a user with lots of cart contents
            let userData;
            try{
                userData = await userModel.findByEmail('dingle@gherts.com');
            } catch(err) {
                throw new Error(err);
            }

            // Get the cart ID for the user we have chosen for this test
            let cartData;
            try{
                cartData = await cartModel.findByUser(userData.user_id);
            } catch(err) {
                throw new Error(err);
            }

            // Get an item to update
            let itemData;
            try{
                itemData = await productModel.findByName({ name: 'The art of coding' });
            } catch(err) {
                throw new Error(err);
            }

            // Run the test and check the results
            chai.request(app)
             .delete(`/carts/${cartData.cart_id}/items/${itemData.product_id}`)
             .end((err, res) => {
                if(err) done(err);
                
                assert.equal(res.statusCode, 200);
                assert.equal(res.body.cart_id, cartData.cart_id);
                assert.equal(res.body.product_id, itemData.product_id);
            });

            // Now check the item has gone from the cart
            chai.request(app)
             .get(`/carts/${cartData.cart_id}`)
             .end((err, res) => {
               if(err) done(err);
               
               assert.equal(res.statusCode, 200);
               assert.isArray(res.body);
               assert.equal(res.body.length, 2);
             });

        });

        it('returns 404 if item does not exist', async () => {

            // Get a user with lots of cart contents
            let userData;
            try{
                userData = await userModel.findByEmail('dingle@gherts.com');
            } catch(err) {
                throw new Error(err);
            }

            // Get the cart ID for the user we have chosen for this test
            let cartData;
            try{
                cartData = await cartModel.findByUser(userData.user_id);
            } catch(err) {
                throw new Error(err);
            }

            // run the test and check the result
            chai.request(app)
             .delete(`/carts/${cartData.cart_id}/items/1`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
             })

        });

    });
 
});