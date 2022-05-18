const { Pool, Client } = require('pg');

const pgpool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
});

/**
 * Tables
 */
const tableCarts = `CREATE TABLE carts(cart_id SERIAL NOT NULL, user_id integer);`;
const tableCartsProducts = `CREATE TABLE carts_products(cart_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER DEFAULT 1);`;
const tableCategories = `CREATE TABLE categories(category_id SERIAL NOT NULL, name CHARACTER VARYING(50));`;
const tableOrders = `CREATE TABLE orders(order_id SERIAL NOT NULL, user_id INTEGER, order_date TIMESTAMP WITHOUT TIME ZONE,
    order_paid_for BOOLEAN, order_notes TEXT, order_shipped TIMESTAMP WITHOUT TIME ZONE, order_arrived TIMESTAMP WITHOUT TIME ZONE,
    order_total_cost NUMERIC);`;
const tableOrdersProducts = `CREATE TABLE orders_products(order_id INTEGER, product_id INTEGER, quantity INTEGER, total NUMERIC);`;
const tableProducts = `CREATE TABLE products(product_id SERIAL NOT NULL, name CHARACTER VARYING(100), description TEXT,
price NUMERIC, image_url CHARACTER VARYING(100), in_stock BOOLEAN);`;
const tableProductCategories = `CREATE TABLE products_categories(product_id INTEGER, category_id INTEGER);`;
const tableUsers = `CREATE TABLE users(user_id SERIAL NOT NULL, email CHARACTER VARYING(150) NOT NULL, 
password CHARACTER VARYING(100) NOT NULL, forename CHARACTER VARYING(50), surname CHARACTER VARYING(50), 
join_date TIMESTAMP WITHOUT TIME ZONE, last_logon TIMESTAMP WITHOUT TIME ZONE, enabled BOOLEAN, 
contact_number CHARACTER VARYING(20), roles CHARACTER VARYING(50) DEFAULT 'Customer' NOT NULL, google CHARACTER VARYING,
avatar_url CHARACTER VARYING);`;

/**
 * Constraints
 */

(async () => {
   
    try{

        /**
         * Create tables
         */
        console.log(`\n== Creating Tables ==\n`)
        await pgpool.query(tableCarts, (err, res) => {
            if(err) throw err;

            console.log(`Carts table created.\n`);
        })

        await pgpool.query(tableCartsProducts, (err, res) => {
            if(err) throw err;

            console.log(`Carts_Products table created.\n`);
        })

        await pgpool.query(tableCategories, (err, res) => {
            if(err) throw err;

            console.log(`Categories table created.\n`);
        })

        await pgpool.query(tableOrders, (err, res) => {
            if(err) throw err;

            console.log(`Orders table created.\n`);
        })

        await pgpool.query(tableOrdersProducts, (err, res) => {
            if(err) throw err;

            console.log(`Orders_Products table created.\n`);
        })

        await pgpool.query(tableProducts, (err, res) => {
            if(err) throw err;

            console.log(`Products table created.\n`);
        })

        await pgpool.query(tableProductCategories, (err, res) => {
            if(err) throw err;

            console.log(`Products_Categories table created.\n`);
        })

        await pgpool.query(tableUsers, (err, res) => {
            if(err) throw err;

            console.log(`Users table created.\n`);
        })

        console.log(`\n== Creating Constraints ==\n`)
     
    } catch(error) {
        console.log(error);
        throw new Error(error);
    }
    
})();

/**
pgpool.query('SELECT * FROM student', (err, res) => {
    if (err) throw err
    console.log(err, res.rows) // Print the data in student table
    pgpool.end()
});
**/
