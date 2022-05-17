const { Pool, Client } = require('pg');

const pgpool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
});

const table = 'CREATE TABLE student(id SERIAL PRIMARY KEY, firstName VARCHAR(40) NOT NULL, lastName VARCHAR(40) NOT NULL, age INT, address VARCHAR(80), email VARCHAR(40))';
const text = 'INSERT INTO student(firstname, lastname, age, address, email) VALUES($1, $2, $3, $4, $5) RETURNING *';
const values = ['Mona the', 'Octocat', 9, '88 Colin P Kelly Jr St, San Francisco, CA 94107, United States', 'octocat@github.com'];

(async () => {
   
    try{
        /**
         * Create the database table
         */
        const tableResult = await pgpool.query(table);
        
        /**
         * Insert the test data
         */
        if(tableResult){
            
            const insertResult = await pgpool.query(text, values);
            console.log(insertResult?.rows);
            
        }
        
    } catch(error) {
        console.log('Error Encountered');
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
