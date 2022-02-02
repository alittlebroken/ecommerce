const chai = require('chai')
const chai_http = require('chai-http')
const assert = chai.assert
const app = require ('../app')

// Include the DB library so we can search for products if need be
const db = require('../db/db')

// Include the products Model
const userModel = require('../models/user')
const productModel = require('../models/products')
const cartModel = require('../models/carts.js')
const orderModel = require('../models/order.js')

// Add plugins for chai
chai.use(chai_http)

describe('Orders', () => {

    describe('POST to /orders', () => {

        it('creates an order with status code 201', async () => {

            // Gather data from the various tables in DB
            let userID;
            let cartID;
            let prod1Id, prod2Id, prod3Id;

            try{
                userID = await userModel.findByEmail('littleted@ursine.com');
                cartID = await cartModel.findByUser(userID);
                prod1Id = await productModel.findByName({ "name": "Grass seed"});
                prod2Id = await productModel.findByName({ "name": "Suckmaster Leaf Blower"});
                prod3Id = await productModel.findByName({ "name": "Pink Fluffy Socks"});
            } catch(err) {
                throw new Error(err);
            }

            // Generate data for the order
            const orderData = {
                "user_id": userID.user_id,
                "order_date": Date.now(),
                "order_paid_for": false,
                "order_notes": "Blah Blah Blah",
                "order_products": [
                    {
                        "product_id": prodId1.product_id,
                        "quantity": 1
                    },
                    {
                        "product_id": prodId2.product_id,
                        "quantity": 1
                    },
                    {
                        "product_id": prodId3.product_id,
                        "quantity": 1
                    }
                ]
            };
            
            // Run the tests and check the response back
            chai.request(app)
             .post('/orders')
             .type('application/data')
             .set('Accept', 'application/json')
             .send(orderData)
             .end((err, res) => {
                if(err) done(err);

                // Run the assertions
                assert.equal(res.statusCode, 201);
                assert.exists(res.body.order_id);

                // Check the order appears
                chai.request(app)
                 .get(`/orders/${res.body.order_id}`)
                 .end((err, res) => {
                     if(err) done(err);

                    assert.equal(res.statusCode, 200);
                    
                    // Check the details are correct
                    assert.equal(res.body.order_date, orderData.order_date);
                    assert.equal(res.body.order_paid_for, orderData.order_paid_for);
                    assert.equal(res.body.order_notes, orderData.order_notes);
                    assert.deepEqual(res.body.order_products, orderData.order_products);
                 });
             });


        });

        it('returns status code 404 with incorrect data passed', async () => {

            // Generate data to be added
            // Gather data from the various tables in DB
            let userID;
            let cartID;
            let prod1Id, prod2Id, prod3Id;

            try{
                userID = await userModel.findByEmail('littleted@ursine.com');
                cartID = await cartModel.findByUser(userID);
                prod1Id = await productModel.findByName({ "name": "Bilge Waters"});
                prod2Id = await productModel.findByName({ "name": "The art of coding"});
                prod3Id = await productModel.findByName({ "name": "Dodge Gaming Wheel"});
            } catch(err) {
                throw new Error(err);
            }

            // Generate data for the order
            const orderData = {
                "user_id": 546372,
                "order_date": Date.now(),
                "order_paid_for": false,
                "order_notes": "Blah Blah Blah",
                "order_products": [
                    {
                        "product_id": prodId1,
                        "quantity": 1
                    },
                    {
                        "product_id": prodId2,
                        "quantity": 1
                    },
                    {
                        "product_id": prodId3,
                        "quantity": 1
                    }
                ]
            };

            chai.request(app)
             .post(`/orders`)
             .type('application/json')
             .set('accept', 'application.json')
             .send(orderData)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
             });

        });

    });

    describe('GET to /orders', () => {

        it('retrieves all orders from the system with status 200', async () => {

            // Get the order list
            chai.request(app)
             .get('/orders')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 200);
                 assert.isArray(res.body);
                 assert.equal(res.body.length,6);
             });

        });

    });

    describe('GET to /orders/:orderId', () => {

        it('retrieves the order with status 200', async () => {
            
            // Get the supporting information
            let user, order;
            try{

                user = await userModel.findByName('littleted@ursine.com');
                order = await orderModel.findByUser(user.user_id);

            } catch(err) {
                throw new Error(err);
            }

            // Run the test and check the response
            chai.request(app)
             .get(`/orders/${order.order_id}`)
             .end((err, res) => {
                if(err) done(err);

                assert.equal(res.statusCode, 200);
                assert.exists(res.body.order_id);
             });

        });

        it('returns 404 when it cant find the order', async () => {
            
            const orderId = 6473623;

            // Run the test and check the response 
            chai.request(app)
             .get(`/orders/${orderId}`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
             });

        });

    });

    describe('PUT to /orders/:orderId', () => {

        it('updates the order and returns status 201', async () => {
            
            // Get the supporting data
            let user, order;
            try{

                user = await userModel.findByName('littleted@ursine.com');
                order = await orderModel.findByUser(user.user_id);

            } catch(err) {
                throw new Error(err);
            }

            const shipDate = Date.now();

            // Create an updated record
            const orderUpdates = {
                "order_id": order.order_id,
                "fields": [
                {
                    "column": "order_paid_for",
                    "value": true
                },
                {
                    "column": "order_shipped",
                    "value": shipDate
                }
                ]
            }

            // Run the test and check the response
            chai.request(app)
             .put(`/orders/${order.order_id}`)
             .type('application/json')
             .set('Accept', 'application/json')
             .send(orderUpdates)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 201);
                 assert.equal(res.body.order_paid_for, true);
                 assert.equal(res.body.order_shipped, shipDate);
                 assert.isArray(res.body.items);
                 assert.equal(res.body.items.length, 3);
             });

        });

        it('returns status 404 when supplied with incorrect information', async () => {
            
            // Get the supporting data
            let user, order;
            try{

                user = await userModel.findByName('littleted@ursine.com');
                order = await orderModel.findByUser(user.user_id);

            } catch(err) {
                throw new Error(err);
            }

            // Create an updated record
            const orderUpdates = {
                "order_id": order.order_id,
                "fields": []
            }

            // Run the test and check the response
            chai.request(app)
             .put(`/orders/${order.order_id}`)
             .type('application/json')
             .set('Accept', 'application/json')
             .send(orderUpdates)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
             });
        });

    });

    describe('DELETE to /orders/:orderID', () => {

        it('deletes the order and returns status 201', async () => {
            
            // Get the supporting data
            let user, order;
            try{

                user = await userModel.findByName('littleted@ursine.com');
                order = await orderModel.findByUser(user.user_id);

            } catch(err) {
                throw new Error(err);
            }

            // Run the test and check the response
            chai.request(app)
             .delete(`/orders/${order.order_id}`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 201);

                 // Check that the record no longer appears in the DB
                 chai.request(app)
                  .get(`/orders/${order/order_id}`)
                  .end((err, res) => {
                    if(err) done(err);

                    assert.equal(404);
                  });
             });

        });

        it('returns 404 when supplied with incorrect information', async () => {
            
            // Set an incorrect order ID
            const orderId = 736463;

            // Run the test and check the response
            chai.request(app)
             .delete(`/orders/${orderId}`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(404);
             });

        });

    });

});

describe('PRODUCTS', () => {

    describe('POST to /products', () => {

        it('creates a product and returns status 201 on success', async () => {

            // Create a sample product to send in json format
            const postData = {
                "name": "Iron Man 4: Iron Harder",
                "description": "Iron Man faces off against his toughest opponent, household chores.",
                "price": 15.99,
                "image_url": null,
                "in_stock": true
            };

            // Post the new data
            chai.request(app)
             .post('/products')
             .type('application/json')
             .set('Accept', 'application/json')
             .send(postData)
             .end((err, res) => {
                 if(err) done(err);
                 
                 assert.equal(res.statusCode, 201);
                 // Check that the data sent back matches the original data
                 assert.equal(res.body.name, postData.name);
                 assert.equal(res.body.description, postData.description);
                 assert.equal(res.body.price, postData.price)
                 assert.equal(res.body.image_url, postData.image_url);
                 assert.equal(res.body.in_stock, postData.in_stock);
             });

        });

        it('fails with status 404 when sent with no data', async () => {

            // POST to the route with no data
            chai.request(app)
             .post('/posts')
             .type('application/json')
             .set('Accept','application/json')
             .send()
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode,404);
             });

        });

        it('fails with status code 400 when sent with incorrect data', async () => {

            // Set the data that will trigger the test
            const postData = {
                "name": "Product to trigger test",
                "description": "Generic product #5679-B",
                "price": "twelve pounds",
                "image_url": null,
                "in_stock": "yes"
            };

            // Send the request and then check the response
            chai.request(app)
             .post('/products')
             .type('application/json')
             .set('Accept', 'application/json')
             .send(postData)
             .end((err, res) => {
                 if(err) done(err);
                 
                 assert.equal(res.statusCode, 400);
             });

        });

    });

    describe('GET to /products', () => {

        it('gets a list of products from the database with status code 200', async () => {

            // Get the products
            chai.request(app)
              .get('/products')
              .end((err, res) => {
                  if(err) done(err);
                  
                  assert.equal(res.statusCode, 200);
                  assert.isArray(res.body);
                  assert.equal(res.body.length, 9);
              });

        });

    });

    describe('GET to /products/:productId', () => {

        it('returns the specified product with status code 200', async () => {

            // Get an ID to search
            let prodId;
            try{
                const result = await productModel.findByName({ "name": 'Iron Man 4: Iron Harder'});

                if(result){
                    prodId = result.product_id;
                }

            } catch(err) {
                throw new Error(err);
            }

            // Perform the test
            chai.request(app)
             .get(`/products/${prodId}`)
             .end((err, res) => {
                 if(err) done(err);
                 assert.equal(res.statusCode, 200);
                 assert.exists(res.body.product_id);
                 
                 // check the details are correct
                 // Check that the data sent back matches the original data
                 assert.equal(res.body.name, "Iron Man 4: Iron Harder");
                 assert.equal(res.body.description, "Iron Man faces off against his toughest opponent, household chores.");
                 assert.equal(res.body.price, 15.99)
                 assert.equal(res.body.image_url, null);
                 assert.equal(res.body.in_stock, true);

             });

        });

        it('returns status 404 when supplied with no identifier', async () => {

            // set a non existant product id
            let prodId;

            // Perform the get
            chai.request(app)
             .get(`/products/${prodId}`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
             });

        });

        it('returns status 404 when supplied with incorrect data', async () => {

            chai.request(app)
             .get('/products/999999999')
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
             });

        });

    });

    describe('PUT to /products/:productId', () => {

        it('updates a product, returns status 200 and the updated record', async () => {
            // Get the ID of a product to update
            let prodId;
            try{
                const result = await productModel.findByName({ "name": 'Iron Man 4: Iron Harder'});

                if(result){
                    prodId = result.product_id;
                }

            } catch(err) {
                throw new Error(err);
            }

            // Now set the dtaa to be updated
            const productUpdate = {
                "name": "Iron Man 4: Iron Harder",
                "description": "Iron Man faces off against his toughest opponent, household chores.",
                "price": 13.99,
                "image_url": null,
                "in_stock": false
            };

            // Run the test and check the results
            chai.request(app)
            .put(`/products/${prodId}`)
            .type('application/json')
            .set('Accept','application/json')
            .send(productUpdate)
            .end((err, res) => {
                if(err) done(err);
                assert.equal(res.statusCode, 200);
                // Check values sent back match the update sent
                assert.equal(res.body.name, productUpdate.name);
                assert.equal(res.body.description, productUpdate.description);
                assert.equal(res.body.price, productUpdate.price);
                assert.equal(res.body.image_url, productUpdate.image_url);
                assert.equal(res.body.in_stock, productUpdate.in_stock);
            });
        });

        it('returns 404 if the product is not found', async () => {

            // Set the non existant product ID
            const product_id = 5647820;

            // Now set the data to be updated
            const productUpdate = {
                "name": "Iron Man 4: Iron Harder",
                "description": "Iron Man faces off against his toughest opponent, household chores.",
                "price": 13.99,
                "image_url": null,
                "in_stock": false
            };

            // Test the update and check the results
            chai.request(app)
             .put(`/products/${product_id}`)
             .type('application/json')
             .set('Accept', 'application/json')
             .send(productUpdate)
             .end((err, res) => {
                 if(err) done(err);
                 assert.equal(res.statusCode, 404);

             });

        });

    });

    describe('DELETE to /products/:productId', () => {

        it('deletes a specific prodict and returns status code 201', async() => {

            // Get the ID of the product we wish to delete
            let prodId;
            try{
                const result = await productModel.findByName({ "name": 'Iron Man 4: Iron Harder'});
                if(result){
                    prodId = result.product_id;
                }
            } catch(err) {
                throw new Error(err);
            }

            // perform the test and check the results
            chai.request(app)
             .delete(`/products/${prodId}`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 201);
             });

             // check that it is indeed deleted
             chai.request(app)
              .get(`/products/${prodId}`)
              .end((err, res) => {
                  if(err) done(err);

                  assert.equal(res.statusCode, 404);
              });

              // Check that we should get all products minus 1
              chai.request(app)
               .get('/products')
               .end((err, res) => {
                    if(err) done(err);

                    assert.equal(re.statusCode, 200);
                    assert.isArray(res.body);
                    assert.equal(res.body.length, 8);
               });

        });

        it('returns status 404 if a record to be deleted cant be found', async () => {

            // set the product id
            const prodId = 324804;

            // Now run the test and check the result
            chai.request(app)
             .delete(`/products/${prodId}`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 404);
             });

        });

    });

});