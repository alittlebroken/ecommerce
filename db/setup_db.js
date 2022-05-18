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

(async () => {
   
    try{

        /**
         * Create tables
         */
        await pgpool.query(tableCarts, (err, res) => {
            if(err) throw err;

            console.log(`Carts table created.\n`);
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
