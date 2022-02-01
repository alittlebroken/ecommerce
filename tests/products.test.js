const chai = require('chai')
const chai_http = require('chai-http')
const assert = chai.assert
const app = require ('../app')

// Include the DB library so we can search for products if need be
const db = require('../db/db')

// Include the products Model
const productModel = require('../models/products')

// Add plugins for chai
chai.use(chai_http)

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