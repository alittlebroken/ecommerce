const { Pool } = require('pg')

const pool = new Pool({
    user: "postgres",
    database: "ecommerce",
    password: "postgres",
    port: 5432,
    host: "localhost"
});

// Exports
module.exports = {pool};