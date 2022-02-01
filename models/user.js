// require needed packages
const createHttpError = require('http-errors');
const db = require('../db/db')

module.exports  = class userModel {

    // find all users
    static async find () {
        try{

            // Try to get the users
            const result = db.query("SELECT * FROM users",'',(err,res) =>{});
        

            // Check we have some records
            if(result.rows.length){
                return result.rows;
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    static async findByEmail (email){
        try{

            // Create the query
            const query = "SELECT * FROM users WHERE email = $1;";
            const values = [email];

            // Run the query
            const result = await db.query(query,values,(err, res) => {});

            // Check we have a record or more
            if(result.rows.length){
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err)
        }
    }

    static async findById (id){
        try{

            // Create the query
            const query = "SELECT * FROM users WHERE user_id = $1;";
            const values = [id];

            // Run the query
            const result = await db.query(query,values,(err, res) => {});

            // Check we have a record or more
            if(result.rows.length){
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err)
        }
    }

    static async create (data){
        try{

            // Create the query
            const query = "INSERT INTO users(email,password,forename, surname) VALUES($1, $2, $3, $4) RETURNING user_id;";
            
            // Get the required values
            const { email, password, forename, surname } = data;
                
            // Run the query
            const result = await db.query(query,[email, password, forename, surname],(err, res) => {});

            // Check we have a record or more
            if(result.rows.length){
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err)
        }
    }

    static async update (data){
        try{

            // Create the query
            const query = "UPDATE users SET $1 = $2 WHERE user_id = $3 RETURNING *;";
            
            // Get the required values
            const { column, value, id } = data;
                
            // Run the query
            const result = await db.query(query,[column, value, id],(err, res) => {});

            // Check we have a record or more
            if(result.rows.length){
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err)
        }
    }

    static async delete (id){
        try{

            // Create the query
            const query = "DELETE FROM users WHERE user_id = $1";
                
            // Run the query
            const result = await db.query(query,[id],(err, res) => {});

            // Check we have a record or more
            if(result.rows.length){
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err)
        }
    }

}