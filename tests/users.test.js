
const chai = require('chai')
const chai_http = require('chai-http')
const assert = chai.assert
const app = require ('../app')

const db = require('../db/db')

// Get the test setup data
require('./setup.js')

// Add plugins for chai
chai.use(chai_http)

// Test data for checks
const userData = [
    {
        "email": "smurfan1865@exmaple.com",
        "forename": "Sara",
        "surname": "Boscoe",
        "password": "smurfette",
        "contact_number": "12345 678901",
    },
    {
        "email": "bieberlover9023@exmaple.com",
        "forename": "Jeremy",
        "surname": "Blastin",
        "password": "bieber4ever",
        "contact_number": "8462 935128",
    },
    {
        "email": "dkendle@exmaple.com",
        "forename": "Derek",
        "surname": "Kendle",
        "password": "password",
        "contact_number": "9472 036729",
    }
];

// Grab the userID from one of the inserts for a user to later use in the GET and update tests
let saved_user_id;

// begin the test suit
describe('Users', () => {

    // Tests for posting a user
    describe('POST to /users', () => {
        
        it('creates a user and returns id as json and status = 201', (done) => {
            chai.request(app)
             .post('/users')
             .type('application.json')
             .set('Accept', 'application/json')
             .send(userData[0])
             .end((err, res) => {
                if(err) done(err);

                // Save the user id for a later test
                saved_user_id = res.body[0].user_id;

                assert.equal(res.statusCode, 201);
                assert.equal(res.type, 'application/json');
                assert.exists(res.body[0].user_id);
                done();
             })
        });

        it('returns status 400 and error message in json when user already exists', (done) => {
            chai.request(app)
             .post('/users')
             .type('application/json')
             .set('Accept', 'application/json')
             .send(userData[0])
             .end((err, res) => {
                if(err) done(err);

                assert.equal(res.statusCode, 400);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.message, "Unable to add record as the data supplied violates uniqueness rules.");
                done();
             })
        });

        it('returns status 404 and error message in json when requested with no data', (done) => {
            chai.request(app)
             .post('/users')
             .type('application.json')
             .set('accept','application/json')
             .send()
             .end((err, res) => {
                if(err) done(err);
                
                assert.equal(res.statusCode, 404);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.message, "One or more values are missing from the request");
                done();
             })
        });

        it('returns status 404 and error message in json when wrong number of columns sent', (done) => {
            chai.request(app)
             .post('/users')
             .type('application.json')
             .set('accept','application/json')
             .send({
                "forename": "Derek",
                "surname": "Kendle",
                "password": "password",
                "contact_number": "9472 036729",
            }) 
             .end((err, res) => {
                if(err) done(err);
                
                assert.equal(res.statusCode, 404);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.message, "One or more values are missing from the request");
                done();
             })
        });

        it('returns status 404 and error message in json when incorrect columns sent', (done) => {
            chai.request(app)
             .post('/users')
             .type('application.json')
             .set('accept','application/json')
             .send({
                "emailaddress": "tossedbanana@mailer.com",
                "forename": "Derek",
                "surname": "Kendle",
                "password": "password",
                "contact_number": "9472 036729",
            })
             .end((err, res) => {
                if(err) done(err);
                
                assert.equal(res.statusCode, 404);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.message, "One or more values are missing from the request");
                done();
             })
        });
    });

    // Tests for getting all users
    describe('GET to /users', () => {

        it('retrieves all users, users are in an array and status code is 200', (done) => {
            chai.request(app)
             .get('/users')
             .end((err, res) => {
                if(err) done(err);

                assert.equal(res.statusCode, 200);
                assert.isArray(res.body); 
                assert.equal(res.body.length, 4);
                done();
             })
        })

    });

    // Tests for getting an individual user
    describe('GET to /users/:userid', () => {

        it('retrieves the specified user with status code 200', (done) => {
 
            chai.request(app)
             .get(`/users/${saved_user_id}`)
             .end((err, res) =>{
                if(err) done(err); 

                assert.equal(res.statusCode, 200);
                assert.equal(res.type, 'application/json');
                assert.isArray(res.body);
                assert.equal(res.body.length, 1)
                done();
             })
        });

        it('fails with error 400 with incorrect data', (done) => {
            chai.request(app)
             .get('/users/twelve')
             .end((err,res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 400);
                 assert.equal(res.body.message, "The URI parameter is not of the expected format");
                 done();
             })
        });

    });

    // Test updating users
    describe('PUT to /users', () => {

        it('updates a user and returns status 200 and update successful message', (done) =>{
            chai.request(app)
             .put(`/users/${saved_user_id}`)
             .type('application.json')
             .set('Accept', 'application/json')
             .send({
                "table_key_col": "user_id",
                data: [
                    { "column": "password", "value": "funkymonkey"}
                ]
            })
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 200);
                 assert.equal(res.body.message, `Record ${saved_user_id} updated successfully`);
                 done();
             })
        });

        it('has set the correct column and value', (done) => {
            chai.request(app)
             .get(`/users/${saved_user_id}`)
             .end((err, res) => {
                if(err) done(err);

                assert.equal(res.statusCode, 200);
                assert.equal(res.body[0].password, "funkymonkey");
                done();
             })
        });

    });

    // TEST DELETE
    describe('DELETE to /users/:userid', async () => {

        it('removes the user with a status code of 200', (done) =>{
            chai.request(app)
             .delete(`/users/${saved_user_id}`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 200);
                 assert.equal(res.body.message, `Record #${saved_user_id} deleted`);
                 done();
             })
        });

        it('only retrieves 3 records from the database', (done) => {
            chai.request(app)
             .get('/users')
             .end((err, res) =>{
                if(err) done(err);

                assert.equal(res.statusCode, 200);
                assert.equal(res.body.length, 3);
                done();
             })
        });

        it('no longer finds the user that was deleted and returns code 404', (done) => {
            chai.request(app)
             .get(`/users/${saved_user_id}`)
             .end((err, res) => {
                 if(err) done(err);
                
                 assert.equal(res.statusCode, 404);
                 assert.equal(res.body.message, "No records were found with the specified parameters");
                 done();
             }) 
        });

    });

    // Get a users orders
    describe('GET to /users/:userid/orders', async () => {

        let id;

        beforeEach(async () => {
           
            // Get and ID from the DB that has some orders
            const query = "SELECT user_id FROM users WHERE email = $1";
            const values = ['mugglelover@magicians.com'];

            const response = await db.query(query, values);
            id = response.rows[0].user_id;
            
        });

        it('returns status 200 and an array of 2 orders', (done) => {

            chai.request(app)
             .get(`/users/${id}/orders`)
             .end((err, res) => {
                 if(err) done(err);
                 assert.equal(res.statusCode, 200);
                 assert.isArray(res.body);
                 assert.equal(res.body.length, 2);
                 done();
             })
        });

        it('returns status 404 if no orders found', (done) => {
            chai.request(app)
             .get(`/users/12/orders`)
             .end((err, res) => {
                if(err) done(err);

                assert.equal(res.statusCode, 404);
                done();
             })
        });

    });

    // Get a users orders
    describe('GET to /users/:userid/orders/:orderid', async () => {

        let id;
        let orderId;

        beforeEach(async () => {
           
            // Get and ID from the DB that has some orders
            let query = "SELECT user_id FROM users WHERE email = $1";
            let values = ['mugglelover@magicians.com'];

            let response = await db.query(query, values);
            id = response.rows[0].user_id;

            // Get a orderId for the user
            query = "SELECT order_id from orders where user_id = $1;";
            values = [id];

            response = await db.query(query, values);
            orderId = response.rows[0].order_id;
            
        });

        it('returns status 200 and the specified order', (done) => {
            chai.request(app)
             .get(`/users/${id}/orders/${orderId}`)
             .end((err, res) => {
                 if(err) done(err);

                 assert.equal(res.statusCode, 200);
                 assert.equal(res.body.length, 1);
                 done();
             })
        });

        it('returns status 404 if the order is not found', (done) => {
            chai.request(app)
             .get(`/users/${id}/orders/1`)
             .end((err, res) => {
                if(err) done(err);

                assert.equal(res.statusCode, 404);
                done();
             })
        });

    });

});

