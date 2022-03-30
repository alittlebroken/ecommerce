// Import the DB
const db = require('../db/db')

module.exports = class cartModel {

    constructor(data = {}){

        this.cartId = parseInt(data.cartId) || null;
        this.userId = parseInt(data.userId) || null;
        this.productId = parseInt(data.productId) || null;
        this.quantity = parseInt(data.quantity) || 1;

    }

    // Find the cart by user
    async findByUser (){
        try{

            const stmt = "SELECT * FROM carts WHERE user_id = $1;";
            const values = [this.userId];

            // run the query
            const result = await db.query(stmt, values);

            if(result.rows.length){
                return result.rows[0];
            }

            return null;

        } catch(err){
            throw new Error(err);
        }
    }

    // Find a cart by cart id
    async findById (){
        try{

            const stmt = "SELECT * FROM carts WHERE cart_id = $1;";
            const values = [this.cartId];

            // Run the statement
            const result = await db.query(stmt, values);

            if(result.rows.length){
                return result.rows[0];
            }

            return null;

        } catch(err){
            throw new Error(err);
        }
    }

    // Find all carts
    async findAllCarts () {
        try{
            const stmt = `SELECT c.cart_id, c.user_id, u.email FROM carts c
                         INNER JOIN users u ON
                         c.user_id = u.user_id;`;

            // Execute the statement
            const result = await db.query(stmt, '');

            if(result.rows.length){
                return result.rows;
            }
            return null;
        } catch(err) {
            throw new Error(err);
        }
    }

    // Create a cart
    async create () {
        try{

            const stmt = "INSERT INTO carts(user_id) VALUES($1) RETURNING *;";
            const values = [this.userId];

            // Execute the statement
            const result = await db.query(stmt, values);

            if(result.rows.length){
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    // add Item to cart
    async addToCart () {

        try{

            // Check to see if the product is already in the cart
            const query = "SELECT * FROM carts_products WHERE cart_id = $1 AND product_id = $2";
            const queryValues = [this.cartId, this.productId];

            let stmt, values;

            const queryResult = await db.query(query, queryValues);

            if(queryResult?.rows?.length){
                const newQuantity = queryResult.rows[0].quantity + 1;
                stmt = "UPDATE carts_products SET quantity = $3 WHERE cart_id = $1 and product_id = $2";
                values = [this.cartId, this.productId, newQuantity]
            } else {
                stmt = "INSERT INTO carts_products(cart_id, product_id, quantity) VALUES($1, $2, $3)";
                values = [this.cartId, this.productId, this.quantity];
            }

            // Run the statement
            const result = await db.query(stmt, values);

            if(result.rows.length){
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }

    }

    // Update item in cart
    async updateCartItem () {

        let stmt;
        let values;
        let result;

        if(parseInt(this.quantity) === 0) {
            // Remove the item from the cart
            try{
                const removedResult = await this.removeCartItem();
                if(removedResult){
                    return removedResult;
                } else {
                    return null;
                }
            } catch(err) {
                throw new Error(err);
            }
        } else {
            // Update the cart item
            try{

                stmt = "UPDATE carts_products SET quantity = $1 WHERE product_id = $2 and cart_id = $3 RETURNING *;";
                values = [this.quantity, this.productId, this.cartId];

                // Execute the statement
                result = await db.query(stmt, values);
                
                if(result.rows.length){
                    return result.rows;
                }

                return null;

            } catch(err) {
                throw new Error(err);
            }
        }

    }

    // Remove an item from the cart
    async removeCartItem () {

        try{

            const stmt = "DELETE FROM carts_products WHERE cart_id IN($1) and product_id IN($2) RETURNING *;";
            const values = [this.cartId, this.productId];

            // Execute the statement
            const result = await db.query(stmt, values);

            if(result?.rows?.length){
                return result.rows;
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }

    }

    // Remove all items from the cart
    async removeAllCartItems () {

        try{
            const stmt = "DELETE FROM carts_products WHERE cart_id = $1 RETURNING *;";
            const values = [this.cartId];

            // Execute the statement
            const result = await db.query(stmt, values);

            if(result.rows.length){
                return result.rows[0];
            }

            return null;
        } catch(err) {
            throw new Error(err);
        }
    }

    // Get all items from the cart
    async findAllCartItems() {
        
        try{
            const stmt = `SELECT u.email,c.cart_id,cp.quantity,p.* FROM users u 
                          INNER JOIN carts c ON u.user_id = c.user_id INNER JOIN 
                          carts_products cp ON c.cart_id = cp.cart_id INNER JOIN 
                          products p ON cp.product_id = p.product_id WHERE 
                          c.cart_id = $1;`;

            const values = [this.cartId];

            
            // Execute the statement
            const result = await db.query(stmt, values);

            if(result?.rows?.length){

                return result.rows;
            }

            return null;

        } catch(err) {
            
            throw new Error(err);
        }

    }

};