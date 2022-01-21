// Load env vars
require('dotenv').config();

const { Pool, Client } = require('pg')

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
    query: async (text, params) => {
        return await pool.query(text, params);
    },
    // Clean out a table of all records, useful for clearing out testing data
    cleanTable: async (table_name, callback) => {
        // Only run if we have a table_name set
        if(!table_name){
            console.log({message: "You must provide a table name to delete from"})
        } else {
            await pool.query("DELETE FROM " + table_name);
        }
    },

};