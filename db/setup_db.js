const { Pool, Client } = require('pg');

const pgpool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
});

/**
 * Sequences
 */
const cartsIDSeq = 'CREATE SEQUENCE carts_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;';

/**
 * Tables
 */
const tableCarts = `CREATE TABLE carts(cart_id integer DEFAULT nextval('carts_id_seq'::regclass) NOT NULL, user_id integer);`;

(async () => {
   
    try{

        /**
         * Create the sequences
         */
        await pgpool.query(cartsIDSeq, (err, res) => {
            if(err) throw err;
        })

        /**
         * Create tables
         */
        await pgpool.query(tableCarts, (err, res) => {
            if(err) throw err;
        })

     
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
