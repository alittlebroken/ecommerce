// Load env vars
require('dotenv').config();

const { Pool, Client } = require('pg');
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
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