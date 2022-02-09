// Required Packages
const request = require('supertest');

// Get access to environment vars
require('dotenv').config();

// Access the DB
const db = require('../db/db');

// Access the app
const app = require('../app');

describe('Authentication', () => {

    // Perform setup and teardown for the tests
    beforeAll(async () => {

    });

    afterAll( async () => {

        // Clear out the users we create
        await db.query('DELETE FROM users WHERE email = $1;', ['undeadlover@immmortals.com']);
        await db.pool.end();
    });

    describe('POST /auth/register', () => {

        it('should register a new customer', async () => {

            // Data to be sent with request
            let postData = {
                email: "undeadlover@immmortals.com",
                password: "br4444441ns!!!"
            }

            // Access the endpoint
            const response = await request(app)
            .post('/auth/register')
            .type('application/json')
            .set('Accept', 'application.json')
            .send(postData);

            // Check the response
            expect(response.statusCode).toEqual(201);
        });

        it('should return 409 when the user already exists', async () => {

            // Data to be sent with request
            let postData = {
                email: "undeadlover@immmortals.com",
                password: "br4444441ns!!!"
            }

            // Access the endpoint
            const response = await request(app)
            .post('/auth/register')
            .type('application/json')
            .set('Accept', 'application.json')
            .send(postData);

            // Check the response
            expect(response.statusCode).toEqual(409);
            expect(response.body.message).toEqual('The supplied email has already been registered.');
        });

    });

    describe('POST /auth/login', () => {

        it('should return a token and status code 200 when a user logs in', async () => {

            // Data to be sent with the request
            let postData = {
                email: "undeadlover@immmortals.com",
                password: "br4444441ns!!!"
            }

            // Access the endpoint
            const response = await request(app)
             .post('/auth/login')
             .type('application/json')
             .set('Accept', 'application/json')
             .send(postData)


             // Check the response is as we expect
             expect(response.statusCode).toEqual(200);
             expect(response.body.token).toBeDefined();

        });

        it('should return 404 when using non registered email', async () => {

            // Generate the post data
            const postData = {
                email: "idont@exists.com",
                password: "shallweenter"
            };

            // Access the endpoint
            const response = await request(app)
              .post('/auth/login')
              .type('application/json')
              .set('Accept','application/json')
              .send(postData)

              // Check the response
              expect(response.statusCode).toEqual(404);
              expect(response.body.message).toEqual('Specified user was not found');

        });

        it('should return 409 with an incorrect password', async () => {

            // Generate the post data
            const postData = {
                email: "undeadlover@immmortals.com",
                password: "br4ins4eva"
            };

            // Access the endpoint
            const response = await request(app)
              .post('/auth/login')
              .type('application/json')
              .set('Accept','application/json')
              .send(postData)

              // Check the response
              expect(response.statusCode).toEqual(409);
              expect(response.body.message).toEqual('The specified password was incorrect');

        });

        it('should return 404 if username or password is missing', async () => {

            // Set the data to be sent along with the post request
            const postData = {
                email: '',
                password: ''
            }

            // Access the post route
            const response = await request(app)
              .post('/auth/login')
              .type('application/json')
              .set('Accept', 'application/json')
              .send(postData)

            // Check the response back
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Missing username or password');

        });

    });

});