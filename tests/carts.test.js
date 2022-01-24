const chai = require('chai')
const chai_http = require('chai-http')
const assert = chai.assert
const app = require ('../app')

const db = require('../db/db')

// Get the test setup data
require('./setup.js')

// Add plugins for chai
chai.use(chai_http)

describe('CARTS', () => {

    describe('POST to /carts', () => {

        xit('Creates a cart for the user, returns cart id and status 201', async (done) => {
            
            // generate the data to be sent
            const data = {
                "userId": 1
            };

            chai.request(app)
             .post('/carts')
             .type('application.json')
             .set('Accept', 'application/json')
             .send(data)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode(201));
                 assert.isNotEmpty(res.body.cartId);
                 done();
             })
        });

        xit('returns status 400 when trying to create a cart that already exists', async (done) => {

            // generate the data to send
            const data = { 
                "userId": 1
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
                 done();
             })

        });

        xit('returns 404 when no infomation is supplied with request', async (done) => {

            // Send the data and test the rsult
            chai.request(app)
             .post('/carts')
             .type('application/json')
             .set('Accept', 'application/json')
             .send()
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
                 done();
             })

        });

    });

    describe('POST to /carts/:cartid', () => {

        xit('Adds an item to the cart and returns 201', async (done) => {

            // Create the payload to send
            const data = {
                "items": [{
                    "productId": 1,
                }]
            };

            // Send the data and check the result
            chai.request(app)
             .post('/carts/1')
             .type('application/json')
             .set('Accept', 'application/json')
             .send(data)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 201);
                 done();
             })

        });

        xit('returns 404 if request data is missing', async (done) => {

            /// POST to the route and check the result back
            chai.request(app)
             .post('/carts/1')
             .type('application/json')
             .set('Accept', 'application/json')
             .send()
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
                 done();
             })

        });

    });

    describe('GET to /carts', () => {

        xit('returns all carts with status of 200', async (done) => {

            // GET to the route and check the result
            chai.request(app)
             .get('/carts')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 200);
                 assert.isArray(res.body);
                 assert.equal(res.body.length, 2);
                 done();
             })

        });

        xit('returns 404 if no carts exist', async (done) => {

            // GET to carts and check the result
            chai.request(app)
             .get('/carts')
             .end((err, res) => {
                if(err) done(err);

                assert.equal(res.statusCode, 404);
                done(err);
             })

        });

    })

    describe ('GET to /carts/:cartid', () => {

        xit('returns a valid cart and contents and status 200', async (done) => {

            // Run the test and check the result
            chai.request(app)
             .get('/carts/1')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 200);
                 assert.isArray(res.body);
                 assert.equal(res.body.length, 2);
                 done();
             })

        });

        xit('returns 404 if the cart is not found', async (done) => {

            // Run the testand check the result
            chai.request(app)
             .get('/carts/2')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
                 done();
             })

        });

    });

    describe('PUT to /carts/:cartid/items/:itemid', () => {

        xit('update item with status 200', async (done) => {

            // Data to update in cart
            const data = {
                "update_col": "quantity",
                "update_val": 2
            };

            // Run the test and check the result
            chai.request(app)
             .put('/carts/1/items/1')
             .type('application/json')
             .set('Accept', 'application.json')
             .send(data)
             .end((err, res) => {
                 if(done) done(err);

                 assert.equal(res.statusCode, 200);
                 assert
                 done();
             })

        });

        xit('returns 404 with missing or incorrect information', async (done) => {

            // Run the test and check the result
            chai.request(app)
             .put('/carts/1/items/1')
             .type('application/json')
             .set('Accept', 'application/json')
             .end((err, res) => {
                 if(err) done(err);

                 accept.equal(res.statusCode, 404);
                 done(err);
             })

        });

    });

    describe('DELETE to /carts/:cartid', () => {

        xit('empties cart and returns status 200', async (done) => {

            // run the test and check the results
            chai.request(app)
             .delete('/carts/1')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 200);
                 done();
             })

        });

        xit('returns 404 if information is missing or incorrect', async (done) => {

            // Run the test and check results
            chai.request(app)
             .delete('/carts/two')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
                 done();
             })

        });

    });

    describe('DELETE to /carts/:cartid/items/:itemid', () => {

        xit('removes item and returns status 200' , async (done) => {

            // Run the test and check the results
            chai.request(app)
             .delete('/carts/1/items/2')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 200);
                 done();
             })

        });

        xit('returns 404 if item does not exist', async (done) => {

            // run the test and check the result
            chai.request(app)
             .delete('/carts/1/items/3')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(404);
                 done();
             })

        });

    });
 
});