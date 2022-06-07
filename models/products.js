// Import required packages
const db = require('../db/db')

module.exports = class productModel {

    constructor( data = {} ){

        // Assign data passed to the class or set defaults if they are missing
        this.product_id = parseInt(data.product_id) || null;
        this.name = data.name || null;
        this.description = data.description || null;
        this.price = parseFloat(data.price) || 0;
        this.image_url = data.image_url || null;
        this.in_stock = data.in_stock || false;
        this.category = parseInt(data.category) || null;

    }

    /**
     * Get a list of the current top 5 products
     */
    async getTopFiveProducts(){
        try{

            /**
             * Create the statement for retrieving the records
             */
            const stmt = `SELECT p.name, op.product_id, count(op.product_id) as total FROM orders_products op INNER JOIN
            products p ON op.product_id = p.product_id GROUP BY p.name, op.product_id ORDER BY total DESC;`;

            /**
             * Run the statement
             */
            const result = await db.query(stmt, '');
        
            /**
             * check we have data to return
             */
            
            if(result?.rows?.length){
               /**
                * Return the data found
                */
               return result.rows;
            }

            /**
             * By default return null
             */
            return null;

        } catch(error) {
            throw new Error(error);
        }
    }


    // Find a product by name
    async findByName () {
        try{

            const stmt = "SELECT * FROM products WHERE name = $1;";
            const values = [this.name];

            // Execute the statement
            const result = await db.query(stmt, values);

            // Check we have some data
            if(result?.rows?.length){
                // Set internal class vars
                this.product_id = result.rows[0].product_id;
                this.name = result.rows[0].name;
                this.description = result.rows[0].description;
                this.price = result.rows[0].price;
                this.image_url = result.rows[0].image_url;
                this.in_stock = result.rows[0].in_stock;

                return result.rows[0];
            }

            // By default return null
            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    // Return all products
    async findAll(){
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
    async findById() {
        try{

            // Only perform the search if we have an ID to search by
            if(this.product_id){
                // Buil;d the statement and values to be executed
                const stmt = "SELECT * FROM products WHERE product_id = $1;";
                const values = [this.product_id];

                // run the statement
                const result = await db.query(stmt, values);
                
                // Check we have got some results
                if(result.rows.length){

                    // Set internal class vars
                    this.name = result.rows[0].name;
                    this.description = result.rows[0].description;
                    this.price = result.rows[0].price;
                    this.image_url = result.rows[0].image_url;
                    this.in_stock = result.rows[0].in_stock;

                    return result.rows;
                }
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    // Find a product by name
    async search () {
        try{

            // Vars for holding the final statement and values 
            let stmt, values;

            /* 
            Generate the correct statement to run based the values for
            name and category
            */
            if(this.name && !this.catgeory){
                /*
                    Searching all products
                */
                stmt = "SELECT * FROM products WHERE LOWER(name) LIKE $1;";
                values = ['%' + this.name + '%'];

            } else if(this.name && this.category) {
                /*
                    Search only amongst those products in the specified category
                */
                stmt = `SELECT p.* FROM products p INNER JOIN products_categories pc \
                on p.product_id = pc.product_ID WHERE LOWER(p.name) LIKE $1 AND pc.category_id \
                = $2`;
                values = ['%' + this.name + '%', this.category];

            } else if (!this.name && this.category){
                /*
                    Pull out all products that match the desired category
                */
                stmt = `SELECT p.* FROM products p INNER JOIN products_categories pc \
                    on p.product_id = pc.product_ID WHERE pc.category_id = $1` 
                    values = [this.category];

            } else {
                /*
                    Return null if no search term or category has been set
                */
                return null;
            }


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
    async add() {

        // add the value to the database
        try{

            // Create the sql statement
            const stmt = `INSERT INTO PRODUCTS(name, description, \
                          price, image_url, in_stock) VALUES( \
                          $1, $2, $3, $4, $5) RETURNING *`;

            if(!parseInt(this.price)){
                return null;
            }

            const values = [
                this.name, 
                this.description, 
                this.price, 
                this.image_url, 
                this.in_stock];

            
            // Run the statement
            const result = await db.query(stmt, values);
            
            if(result.rows){
                // Set internal class vars
                this.product_id = result.rows[0].product_id;
                this.name = result.rows[0].name;
                this.description = result.rows[0].description;
                this.price = result.rows[0].price;
                this.image_url = result.rows[0].image_url;
                this.in_stock = result.rows[0].in_stock;

                return result.rows;
            }

            return null;
        } catch(err) {
            throw new Error(err);
        }

    }

    // Update a product within the database
    async update() {
        
        // Update the record in the database
        try{

            // Generate vars for the statement and it's values
            const stmt = "UPDATE products SET \
                          name = $1, description = $2, \
                          price = $3, image_url = $4, \
                          in_stock = $5 WHERE product_id = $6 RETURNING *;";

            const values = [
                this.name, 
                this.description, 
                this.price, 
                this.image_url, 
                this.in_stock, 
                parseInt(this.product_id)
            ];

            // Run the statement and store the result
            const result = await db.query(stmt, values);
            
            if(result.rows?.length) {
                // Set internal class vars
                
                this.product_id = result.rows[0].product_id;
                this.name = result.rows[0].name;
                this.description = result.rows[0].description;
                this.price = result.rows[0].price;
                this.image_url = result.rows[0].image_url;
                this.in_stock = result.rows[0].in_stock;
                return result.rows;
            } 
            return null;

        } catch(err) {
            
            throw new Error(err);
        }
    }

    // Delete a specific product
    async deleteById() {
        try{

            // Delete statement
            const stmt = "DELETE FROM products WHERE product_id = $1 RETURNING *;";
            const values = [this.product_id];

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