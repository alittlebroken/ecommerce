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
module.exports = {pool};