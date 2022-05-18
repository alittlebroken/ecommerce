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
const constraintCartsCartId = `ALTER TABLE carts ADD CONSTRAINT carts_pkey PRIMARY KEY (cart_id);`;
const constraintCartsUserId = `ALTER TABLE carts ADD CONSTRAINT carts_user_id_key UNIQUE (user_id);`;
const constraintCategories = `ALTER TABLE categories ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);`;
const constraintOrders = `ALTER TABLE orders ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);`;
const constraintProducts = `ALTER TABLE products ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);`;
const constraintUsersUserId = `ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);`;
const constraintUsersEmailKey = `ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);`;
const constraintCartsUserForeignKey = `ALTER TABLE carts ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id);`;
const constraintOrdersProductsForeignKey = `ALTER TABLE ONLY orders_products ADD CONSTRAINT orders_products_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(order_id);`;
const constraintOrdersProductsUsersForeignKey = `ALTER TABLE ONLY orders_products ADD CONSTRAINT orders_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id);`;
const constraintOrdersUserIdForeignKey = `ALTER TABLE ONLY orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id);`;
const constraintProductsCategoriesForeignKey = `ALTER TABLE ONLY products_categories ADD CONSTRAINT products_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(category_id);`;
const constraintProductsCategoriesProductIdForeignKey = `ALTER TABLE ONLY products_categories ADD CONSTRAINT products_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id);`;

/**
 * Runs a sql query against the database
 * @param {string} statement The SQL statement to run against the database
 */
const execute = async (statement) => {

    await pgpool.query(statement, (err, res) => {
        if(err) throw err;

        console.log(res);
    })

};

(async () => {
   
    try{

        /**
         * Create tables
         */
        await execute(tableCarts);
        await execute(tableCartsProducts);
        await execute(tableCategories);
        await execute(tableOrders);
        await execute(tableOrdersProducts);
        await execute(tableProducts);
        await execute(tableProductCategories);
        await execute(tableUsers);


        pgpool.query(constraintCartsCartId, (err, res) => {
            if (err)
                throw err;

            console.log(`Carts primary key constraint created.\n`);
        })

        pgpool.query(constraintCartsUserId, (err, res) => {
            if (err)
                throw err;

            console.log(`Carts user_id unique key constraint created.\n`);
        })

        pgpool.query(constraintCategories, (err, res) => {
            if (err)
                throw err;

            console.log(`Categories primary key constraint created.\n`);
        })

        pgpool.query(constraintOrders, (err, res) => {
            if (err)
                throw err;

            console.log(`Orders primary key constraint created.\n`);
        })

        pgpool.query(constraintProducts, (err, res) => {
            if (err)
                throw err;

            console.log(`Products primary key constraint created.\n`);
        })

        pgpool.query(constraintUsersUserId, (err, res) => {
            if (err)
                throw err;

            console.log(`Users primary key constraint created.\n`);
        })

        pgpool.query(constraintUsersEmailKey, (err, res) => {
            if (err)
                throw err;

            console.log(`Users email unique key constraint created.\n`);
        })

        pgpool.query(constraintCartsUserForeignKey, (err, res) => {
            if (err)
                throw err;

            console.log(`Carts user_id foreign key constraint created.\n`);
        })

        pgpool.query(constraintOrdersProductsForeignKey, (err, res) => {
            if (err)
                throw err;

            console.log(`Orders_Products order_id foreign key constraint created.\n`);
        })

        pgpool.query(constraintOrdersProductsUsersForeignKey, (err, res) => {
            if (err)
                throw err;

            console.log(`Orders_Products product_id foreign key constraint created.\n`);
        })

        pgpool.query(constraintOrdersUserIdForeignKey, (err, res) => {
            if (err)
                throw err;

            console.log(`Orders user_id foreign key constraint created.\n`);
        })

        pgpool.query(constraintProductsCategoriesForeignKey, (err, res) => {
            if (err)
                throw err;

            console.log(`Product_Categories category_id foreign key constraint created.\n`);
        })

        pgpool.query(constraintProductsCategoriesProductIdForeignKey, (err, res) => {
            if (err)
                throw err;

            console.log(`Product_Categories product_id foreign key constraint created.\n`);
        })

     
    } catch(error) {
        console.log(error);
        throw new Error(error);
    }
    
})();