// Include DB
const db = require('../db/db')

module.exports = class orderItem {

    constructor(data) {
        this.item_id = data.product_id || null,
        this.name = data.name || null,
        this.description = data.description || null,
        this.price = data.price || 0,
        this.image_url = data.image_url || null,
        this.in_stock = data.in_stock || false,
        this.orderId = data.orderId || 0,
        this.qty = data.quantity || 1
    }

    static async create() {

        try{

            // Create the statement and assign the values
            const stmt = `INSERT INTO orders_products(order_id, \
                          product_id, quantity, total) VALUES \
                          ($1, $2, $3, $4) RTEURNING *;`;

            // Work out the total cost of this item
            const total  = parseFloat(this.price) * parseInt(this.qty);

            // Assign the values
            const values = [this.orderId, this.item_id, this.qty, total];

            // Add the record
            const result = await db.query(stmt, values);

            if(result.rows.length){
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }

    }

};