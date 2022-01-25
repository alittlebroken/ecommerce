// Setup file to load data into the DB for testing purposes
const db = require('../db/db')

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