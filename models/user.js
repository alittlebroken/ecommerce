// require needed packages
const db = require('../db/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const cartModel = require('./carts');

module.exports  = class userModel {

    // Class constructor
    constructor(data = {}){
        this.id = data.id || null,
        this.email = data.email || null,
        this.password = data.password || null,
        this.is_admin = data.is_admin || false,
        this.is_logged_in = data.is_logged_in || false,
        this.last_logon = data.last_logon || null,
        this.roles = data.roles || 'Customer',
        this.cartId = data.cartId || null
    }

    /**
     * Creates a new entry in the users table for a google ID
     * @param {object} profile  The returned profile information from google
     * @returns { object } user The created user
     */
    async createGoogleUser(profile){

        /** 
         * destruct the passed in object for the relevant properties
         */
        const {
            id, email, picture, given_name, family_name
        } = profile;

        try{

            /** 
             * Create the vars used for inserting into the DB
             */
            const stmt = `INSERT INTO users 
            (email, password, forename, surname, join_date, roles, google, enabled, avatar_url) 
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7, $8) RETURNING *;`;

            const values = [
                email,
                this.hashPassword(id),
                given_name,
                family_name,
                'Customer',
                id,
                true,
                picture
            ];

            /**
             * Execute the DB statement
             */
            const result = await db.query(stmt, values);

            /**
             * Check we have some records to return
             */
            if(result?.rows?.length){

                /**
                 * Create a cart for the user
                 */
                 const cart = new cartModel({ userId: result.rows[0].user_id });
                 const cartResult = await cart.create();

                 /**
                  * Generate a new object to send back
                  */
                 const user = {
                     user_id: result.rows[0].user_id,
                     email: result.rows[0].email,
                     forename: result.rows[0].forename,
                     surname: result.rows[0].surname,
                     join_date: result.rows[0].join_date,
                     enabled: result.rows[0].enabled,
                     contact_number: result.rows[0].contact_number,
                     roles: result.rows[0].roles,
                     google: result.rows[0].google,
                     avatar_url: result.rows[0].avatar_url,
                     cart_id: cartResult.rows[0].cart_id
                 }

                 return user;
                 //return result.rows[0];
            }

            /** 
             * By default return false
             */
            return false

        } catch(error) {
            throw new Error(error);
        }

    }

    /**
     * Find a login via google ID
     * @param {integer} google_id  The users google ID returned from a google login
     * @returns {object} user || false  Either the found user data in the DB or false
     */
     async findByGoogleId(google_id) {

        try{

            /**
             * Create the vars for the DB statement
             */
            //const stmt = `SELECT * FROM users WHERE google = $1`;
            const stmt = "SELECT u.*, c.cart_id FROM users u INNER JOIN carts c ON c.user_id = u.user_id WHERE google = $1;";
            const values = [google_id];

            /**
             * Run the DB statement
             */
            const result = await db.query(stmt, values);

            /**
             * Check we have a record and if so then return it
             */
            if(result?.rows?.length){
                /**
                 * Generate a new object to send back and remove the password field
                 */
                 const user = {
                    user_id: result.rows[0].user_id,
                    email: result.rows[0].email,
                    forename: result.rows[0].forename,
                    surname: result.rows[0].surname,
                    join_date: result.rows[0].join_date,
                    enabled: result.rows[0].enabled,
                    contact_number: result.rows[0].contact_number,
                    roles: result.rows[0].roles,
                    google: result.rows[0].google,
                    avatar_url: result.rows[0].avatar_url,
                    cart_id: result.rows[0].cart_id
                }
                return user;
            }

            /** 
             * By default return false
             */
            return false

        } catch (error) {
            throw new Error(error);
        }

    }

    // find all users
    async find () {
        try{

            // Try to get the users
            const result = db.query(`SELECT u.user_id, u.email, u.forename, u.surname,
            u.join_date, u.last_logon, u.enabled, u.contact_number, u.roles, c.cart_id 
            FROM users u INNER JOIN carts c ON c.user_id = u.user_id`,'',(err,res) =>{});
        
            // Check we have some records
            if(result.rows?.length){
                return result.rows;
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    async findByEmail (){
        try{
            
            // Create the query
            const query = `SELECT u.user_id, u.email, u.forename, u.surname,
            u.join_date, u.last_logon, u.enabled, u.contact_number, u.roles, c.cart_id 
            FROM users u INNER JOIN carts c ON c.user_id = u.user_id WHERE email = $1 
            AND u.google is null;`;
            const values = [this.email];

            // Run the query
            const result = await db.query(query,values);
            
            // Check we have a record or more
            if(result.rows?.length){
                
                // Assign local vars the required data from the returned resultset
                this.id = result.rows[0].user_id;
                this.email = result.rows[0].email;
                this.password = result.rows[0].password;
                this.roles = result.rows[0].roles;
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err)
        }
    }

    async findById (id){
        try{

            // Create the query
          
            const query = `SELECT u.user_id, u.email, u.forename, u.surname,
            u.join_date, u.last_logon, u.enabled, u.contact_number, u.roles, c.cart_id 
            FROM users u INNER JOIN carts c ON c.user_id = u.user_id WHERE user_id = $1 
            AND u.google = null;`;
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

    async create (){
        try{

            // Create the query
            const queryString = `INSERT INTO users(email,password,forename,\
                surname,contact_number, roles) VALUES($1, $2, $3, $4, $5, $6) \
                RETURNING *;`;

            // Generate a hashed password
            const hash = await bcrypt.hash(this.password, 10);

            // Set the values to use
            const values = [
                this.email,
                hash,
                this.forename,
                this.surname,
                this.contact_number,
                this.roles
            ];

            // Run the query
            const result = await db.query(queryString,values);

            // Check we have a record or more
            if(result?.rows?.length){
                // Populate the ID after we have created a user
                this.id = result.rows[0].user_id;

                // generate a new cart for the user as well
                    const cart = new cartModel({ userId: this.id });
                    const cartResult = await cart.create();
                    
                    if(cartResult?.cart_id){
                        
                        this.cartId = cartResult.cart_id;
                    } 

                // Send back the result to the calling script
                const user = {
                    user_id: result.rows[0].user_id,
                    email: result.rows[0].email,
                    forename: result.rows[0].forename,
                    surname: result.rows[0].surname,
                    join_date: result.rows[0].join_date,
                    last_logon: result.rows[0].last_logon,
                    enabled: result.rows[0].enabled,
                    contact_number: result.rows[0].contact_number,
                    roles: result.rows[0].roles,
                    cart_id: this.cartId,
                }
                return user;
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    /**
     * 
     * Set the last login time for a user
     */
    async setLastLogin(payload){

        try{

            /**
             * Extract the required data from the payload
             */
            const { user_id, last_logon } = payload;

            /**
             * Create the query and set the values
             */
            const stmt = `UPDATE users set last_logon = $1 WHERE user_id = $2 RETURNING *;`;
            const values = [last_logon, user_id];

            /**
             * Run the statement
             */
            const result = await db.query(stmt, values);

            /**
             * Check the result of the update
             */
            if(result?.rows?.lenght){
                return result.rows[0];
            }

            /** 
             * By default return null
             */
            return null;

        } catch(error) {
            throw new Error(error);
        }

    }

    async update(data){
        try{

            // Create the query
            const stmt = `UPDATE users SET $1 = $2 WHERE user_id = $3 RETURNING *;`;
            
            // Get the required values
            const { column, value, id } = data;
           
            // Run the query
            const result = await db.query(stmt,[column, value, id]);

            // Check we have a record or more
            if(result?.rows?.length){
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err)
        }
    }

    async delete (id){
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
    async hashPassword(password) {
        
        // Attempt to hash the password
        try{

            const hashedPassword = await bcrypt.hash(password, 10);
            return hashedPassword;

        } catch(err) {
            console.log(err)
        }
        
    }

    // Returns true if passwords match, false otherwise
    async verifyPassword(hash, password){
        return await bcrypt.compare(password, hash);
    }

    // Generates a json web token used in authorizing the user
    async generateAccessToken(data){

        return jwt.sign(
            data, 
            process.env.TOKEN_SECRET, 
            { expiresIn: process.env.TOKEN_EXPIRATION}
        );

    }

}