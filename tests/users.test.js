
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

// Add another record for this test
before('Test Setup', async () => {
    
    // User Setup
    const userQuery = "INSERT INTO users(email, password, forename, surname \
        ) VALUES($1, $2, $3, $4) RETURNING user_id;";

    const users = [
        { email: 'dingle@gherts.com', password: 'fightme', forename: 'Thomas', surname: 'Dingle' },
        { email: 'mugglelover@magicians.com', password: 'nofightme', forename: 'Francine', surname: 'Hoggle' },
        { email: 'sfringle@corpbuster.com', password: 'yesfightthem', forename: 'Sam', surname: 'Fringle' }
    ];

    const user1 = await db.query(userQuery, [users[0].email, users[0].password, users[0].forename, users[0].surname]);
    const user2 = await db.query(userQuery, [users[1].email, users[1].password, users[1].forename, users[1].surname]);
    const user3 = await db.query(userQuery, [users[2].email, users[2].password, users[2].forename, users[2].surname]);

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

    // Products setup
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

    const order1 = await db.query(orderQuery, [user1.rows[0].user_id, '2022-01-01 12:15:46', false, 15.99]); // prod 1
    const order2 = await db.query(orderQuery, [user2.rows[0].user_id, '2021-11-15 03:30:21', false, 135.98]); // prod 5, 8
    const order3 = await db.query(orderQuery, [user2.rows[0].user_id, '2022-01-10 15:06:56', false, 254.98]); // prod 
    const order4 = await db.query(orderQuery, [user3.rows[0].user_id, '2021-03-29 17:24:18', false, 19.98]); // prod
    const order5 = await db.query(orderQuery, [user3.rows[0].user_id, '2021-09-03 21:25:45', false, 55.98]); // prod 

    // Order Products
    const orderProdQuery = "INSERT INTO orders_products(order_id, product_id, quantity) VALUES($1, $2, $3);";

    await db.query(orderProdQuery, [order1.rows[0].order_id, prod1.rows[0].product_id, 1]);
    await db.query(orderProdQuery, [order2.rows[0].order_id, prod5.rows[0].product_id, 1]);
    await db.query(orderProdQuery, [order2.rows[0].order_id, prod8.rows[0].product_id, 1]);
    await db.query(orderProdQuery, [order3.rows[0].order_id, prod3.rows[0].product_id, 1]);
    await db.query(orderProdQuery, [order3.rows[0].order_id, prod4.rows[0].product_id, 1]);
    await db.query(orderProdQuery, [order4.rows[0].order_id, prod7.rows[0].product_id, 1]);
    await db.query(orderProdQuery, [order4.rows[0].order_id, prod2.rows[0].product_id, 1]);
    await db.query(orderProdQuery, [order5.rows[0].order_id, prod1.rows[0].product_id, 1]);
    await db.query(orderProdQuery, [order5.rows[0].order_id, prod6.rows[0].product_id, 1]);

    // Carts
    const cartQuery = "INSERT INTO carts(user_id) VALUES($1) RETURNING cart_id;";

    const cart1 = await db.query(cartQuery, [user1.rows[0].user_id]);
    const cart2 = await db.query(cartQuery, [user2.rows[0].user_id]);
    const cart3 = await db.query(cartQuery, [user3.rows[0].user_id]);

    // Carts Products
    const cartProdQuery = "INSERT INTO carts_products(cart_id, product_id) VALUES($1, $2);";
    await db.query(cartProdQuery,[cart1.rows[0].cart_id, prod1.rows[0].product_id]);
    await db.query(cartProdQuery,[cart1.rows[0].cart_id, prod2.rows[0].product_id]);
    await db.query(cartProdQuery,[cart1.rows[0].cart_id, prod6.rows[0].product_id]);
    await db.query(cartProdQuery,[cart1.rows[0].cart_id, prod7.rows[0].product_id]);
    await db.query(cartProdQuery,[cart3.rows[0].cart_id, prod4.rows[0].product_id]);

});

// Clean up the users table after the tests have been run
after('Test Teardown', async () => {
    await db.cleanTable("carts_products");
    await db.cleanTable("carts");
    await db.cleanTable("orders_products");
    await db.cleanTable("orders");
    await db.cleanTable("products_categories");
    await db.cleanTable("products");
    await db.cleanTable("categories");
    await db.cleanTable("users");
});

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

