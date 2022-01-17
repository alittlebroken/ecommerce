// Load env vars
require('dotenv').config();

const { Pool } = require('pg')

const pool = new Pool({
    user: process.env.DBUSER,
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: parseInt(process.env.DBPORT),
    host: process.env.DBHOST
});

// Exports
module.exports = {
    pool,
    query: async (text, params, callback) => {
        const start = Date.now();
        return await pool.query(text, params, (err, res) => {
            const duration = Date.now() - start;
            console.log('Executed query', {text, duration, rows: res.rowCount})
            callback(err, res);
        });
    },
};