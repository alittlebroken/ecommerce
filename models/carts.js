// Import the DB
const db = require('../db/db')

module.exports = class cartModel {

    // Find the cart by user
    static async findByUser (userId){
        try{

            const stmt = "SELECT * FROM carts WHERE user_id = $1;";
            const values = [userId];

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
    static async findById (cartId){
        try{

            const stmt = "SELECT * FROM carts WHERE cart_id = $1;";
            const values = [cartId];

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
    static async findAllCarts () {
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
    static async create (userId) {
        try{

            const stmt = "INSERT INTO carts(user_id) VALUES($1) RETURNING *;";
            const values = [userId];

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
    static async addToCart (data) {

        const { cartId, productId, quantity } = data;

        try{

            const stmt = "INSERT INTO carts_products(cart_id, product_id, quantity) VALUES($1, $2, $3) RETURNING *;";
            const values = [cartId, productId, quantity];

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
    static async updateCartItem (data) {

        const { cartId, productId, quantity } = data;
        let stmt;
        let values;
        let result;

        if(parseInt(quantity) === 0) {
            // Remove the item from the cart
            try{
                const removedResult = await this.removeCartItem({ cartId, productId });

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
                values = [quantity, productId, cartId];

                // Execute the statement
                result = await db.query(stmt, values);
                
                if(result.rows.length){
                    return result.rows[0];
                }

                return null;

            } catch(err) {
                throw new Error(err);
            }
        }

    }

    // Remove an item from the cart
    static async removeCartItem (data) {
        
        const { cartId, productId } = data;

        try{

            const stmt = "DELETE FROM carts_products where cart_id = $1 and product_id = $2 RETURNING *;";
            const values = [cartId, productId];

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

    // Remove all items from the cart
    static async removeAllCartItems (data) {

        const { cartId } = data;

        try{
            const stmt = "DELETE FROM carts_products WHERE cart_id = $1 RETURNING *;";
            const values = [cartId];

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
    static async findAllCartItems(data) {

        const { cartId } = data;
        
        try{
            const stmt = `SELECT u.email,c.cart_id,cp.quantity,p.* FROM users u 
                          INNER JOIN carts c ON u.user_id = c.user_id INNER JOIN 
                          carts_products cp ON c.cart_id = cp.cart_id INNER JOIN 
                          products p ON cp.product_id = p.product_id WHERE 
                          c.cart_id = $1;`;

            const values = [cartId];
            

            // Execute the statement
            const result = await db.query(stmt, values);
            
            if(result.rows.length){
                
                return result.rows;
            }

            return null;

        } catch(err) {
            
            throw new Error(err);
        }

    }

};