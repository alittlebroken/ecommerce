// Import required packages
const db = require('../db/db')

module.exports = class productModel {

    // Find a product by name
    static async findByName (data) {
        try{

            const { name } = data;

            const stmt = "SELECT * FROM products WHERE name = $1;";
            const values = [name];

            // Execute the statement
            const result = await db.query(stmt, values);

            // Check we have some data
            if(result.rows.length){
                return result.rows[0];
            }

            // By default return null
            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    // Return all products
    static async findAll(){
        try{

            // Create the statement
            const stmt = "SELECT * FROM products;";

            // execute the statement
            const results = await db.query(stmt, '');

            // check we have some records
            if(results.rows.length){
                return results.rows;
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    // Find a product by it's ID
    static async findById(id) {
        try{

            // Only perform the search if we have an ID to search by
            if(id){
                // Buil;d the statement and values to be executed
                const stmt = "SELECT * FROM products WHERE product_id = $1;";
                const values = [id];

                // run the statement
                const result = await db.query(stmt, values);

                // Check we have got some results
                if(result.rows.length){
                    return result.rows[0];
                }
            }

            return null;

        } catch(err) {
            throw new error(err);
        }
    }

    // Find a product by name
    static async search (data) {
        try{

            const { name } = data;

            const stmt = "SELECT * FROM products WHERE name LIKE $1;";
            const values = ['%' + name + '%'];

            // Execute the statement
            const result = await db.query(stmt, values);

            // Check we have some data
            if(result.rows.length){
                return result.rows;
            }

            // By default return null
            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    // Add a product to the database
    static async add(data) {

        // extract the values from the parameter
        const {
            name,
            description,
            price,
            image_url,
            in_stock
        } = data;

        // add the value to the database
        try{

            // Create the sql statement
            const stmt = `INSERT INTO PRODUCTS(name, description, \
                          price, image_url, in_stock) VALUES( \
                          $1, $2, $3, $4, $5) RETURNING *`;

            if(!parseInt(price)){
                return null;
            }

            const values = [name, description, price, image_url, in_stock];

            
            // Run the statement
            const result = await db.query(stmt, values);
            
            if(result.rows){
                return result.rows[0];
            }

            return null;
        } catch(err) {
            throw new Error(err);
        }

    }

    // Update a product within the database
    static async update(data) {
        // Get the values passed in
        const {
            product_id,
            name,
            description,
            price,
            image_url,
            in_stock
        } = data;

        // Update the record in the database
        try{

            // Generate vars for the statement and it's values
            const stmt = "UPDATE products SET \
                          name = $1, description = $2, \
                          price = $3, image_url = $4, \
                          in_stock = $5 WHERE product_id = $6 RETURNING *;";

            const values = [name, description, price, image_url, in_stock, product_id];

            // Run the statement and store the result
            const result = await db.query(stmt, values);

            if(result.rows) {
                return result.rows[0];
            } 

            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    // Delete a specific product
    static async deleteById(id) {
        try{

            // Delete statement
            const stmt = "DELETE FROM products WHERE product_id = $1 RETURNING *;";
            const values = [id];

            // Execute the statement
            const result = await db.query(stmt, values);

            if(result.rows){
                return result.rows[0];
            }

            return null;

        } catch(err) { 
            throw new Error(err);
        }
    }

};