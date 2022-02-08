// require needed packages
const db = require('../db/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports  = class userModel {

    // Class constructor
    constructor(data = {}){
        this.id = data.id || null,
        this.email = data.email || null,
        this.password = data.password || null,
        this.is_admin = data.is_admin || false,
        this.is_logged_in = data_is_logged_in || false,
        this.last_logon = data.last_logon || null
    }

    // find all users
    static async find () {
        try{

            // Try to get the users
            const result = db.query("SELECT * FROM users",'',(err,res) =>{});
        

            // Check we have some records
            if(result.rows?.length){
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
            if(result.rows?.length){
                // Assign local vars the required data from the returned resultset
                this.id = result.rows[0].user_id;
                this.email = result.rows[0].email;
                this.password = result.rows[0].password;
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
            if(result.rows?.length){
                // Assign local vars the required data from the returned resultset
                this.id = result.rows[0].user_id;
                this.email = result.rows[0].email;
                this.password = result.rows[0].password;
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
            const query = "INSERT INTO users(email,password,forename, surname) VALUES($1, $2, $3, $4) RETURNING *;";
            
            // Get the required values
            const { email, password, forename, surname } = data;
            
            // Generate a hashed password
            const salt = await bcrypt.genSalt(31);
            const hash = await this.hashPassword(password, salt);
            
            
            // Run the query
            const result = await db.query(query,[email, hash, forename, surname]);

            // Check we have a record or more
            if(result.rows.length){
                // Assign local vars the required data from the returned resultset
                this.id = result.rows[0].user_id;
                this.email = result.rows[0].email;
                this.password = result.rows[0].password;

                // Send back the result to the calling script
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

    // Creates a hashed password for the user
    static async hashPassword(password) {
        return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
    }

    // Returns true if passwords match, false otherwise
    static async verifyPassword(hash, password){
        return await bcrypt.compare(password, hash);
    }

    // Generates a jason web token used in authorizing the user
    static async generateAccessToken(data){

        return jwt.sign(data, process.env.TOKEN_SECRET);

    }

}