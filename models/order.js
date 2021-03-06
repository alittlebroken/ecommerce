// Import the DB
const db = require('../db/db')

// Include the order Item model
const orderItem = require('./orderItem')

module.exports = class orderModel {

    constructor(data = {}) {

        this.order_id = data.order_id || 0,
        this.user_id = data.user_id || 0,
        this.items = data.items || [],
        this.order_date = data.order_date || Date.now(),
        this.order_paid_for = data.order_paid_for || false,
        this.order_notes = data.notes || null,
        this.order_shipped = data.shipped || null,
        this.order_arrived = data.arrived || null,
        this.order_total_cost = data.total_cost  || 0,
        this.line_total = data.line_total || 0

    }

    // Add items to the order
    async addItems(items = {}){
        this.items.append(items.map(item => {
            let data = {
                item_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                orderId: this.order_id
            };
            return new orderItem(data);
        }));
    }

    // Create the order
    async create() {

        // Attempt to create the order
        try{

            // Insert statement
            const stmt = `INSERT INTO orders(user_id, order_date, \
                          order_paid_for, order_notes, order_shipped, \
                          order_arrived, order_total_cost) VALUES (\
                          $1, $2, $3, $4, $5, $6, $7) RETURNING order_id;`;

            // Work out the total cost
            let total_cost;

            if(this.items.length > 0){

                this.items.map(item => {
                    total_cost += parseFloat(item.total);
                });

            } else {
                total_cost = this.order_total_cost;
            }
            
            // Values to be inserted
            const values = [
                this.user_id,
                this.order_date,
                this.order_paid_for,
                this.order_notes,
                this.order_shipped,
                this.order_arrived,
                total_cost
            ];

            // add to the database
            const result = await db.query(stmt, values);

            if(result?.rows?.length){

                this.order_id = result.rows[0];
                return result.rows[0];
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }

    }

    // Find items associated with this order
    async findItems() {
        try{

            // Create the statement
            const stmt = `SELECT p.*, op.quantity, op.total FROM products p INNER JOIN \
                          orders_products op ON p.product_id = op.product_id \
                          WHERE op.order_id = $1;`;

            const values = [this.order_id];

            const result = await db.query(stmt, values);

            if(result?.rows?.length){
                return result.rows;
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

    // Find orders based on user id
    async findByUserId() {
        try{

            // Create the statement
            const stmt = "SELECT * FROM orders WHERE user_id = $1;";
            const values = [this.order_id];

            // Execute the statement
            const result = await db.query(stmt, values);
            if(result.rows?.length){
                return result.rows;
            }

            return null;

        } catch(err) {  
            throw new Error(err);
        }
    }

    // Find an order in the database
    async findOrder() {
        try{

            // Create the statement and execute it against the database
            const stmt = `SELECT o.*, op.quantity, (op.quantity * p.price) \ 
                          as line_total, p.* FROM orders o INNER JOIN orders_products op \
                          ON o.order_id = op.order_id INNER JOIN products p ON \
                          p.product_id = op.product_id WHERE o.order_id = $1`;
            
            const values = [this.order_id];

            const result = await db.query(stmt, values);
    
            if(result.rows?.length){
                /**
                 * Assign the data to the class vars
                 */
                 this.order_id = result.rows[0].order_id;
                 this.user_id = result.rows[0].user_id;
                 this.items = await this.findItems();
                 this.order_date = result.rows[0].order_date;
                 this.order_paid_for = result.rows[0].order_paid_for;
                 this.order_notes = result.rows[0].order_notes;
                 this.order_shipped = result.rows[0].order_shipped;
                 this.order_arrived = result.rows[0].order_arrived;
                 this.order_total_cost = result.rows[0].order_total_cost;

                /**
                 * Build the return object
                 */
                const returnData = [];
                const returnObject = {
                    order_id: this.order_id,
                    user_id: this.user_id,
                    items: this.items,
                    order_date: this.order_date,
                    order_paid_for: this.order_paid_for,
                    order_notes: this.order_notes,
                    order_shipped: this.order_shipped,
                    order_arrived: this.order_arrived,
                    order_total_cost: parseFloat(this.order_total_cost).toFixed(2),
                };
                returnData.push(returnObject);
                return returnData;
                //return result.rows;
            }

            return null;

        } catch(err) {
            
            throw new Error(err);
        }
    }

    async findOrders() {

        try{

            // Generate the statement to get all orders from the DB
            const stmt = "SELECT * FROM orders;";
            // Execute the statement
            const result = await db.query(stmt, '');

            // Check we have some records
            if(result.rows?.length){
                return result.rows;
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }

    }

    // Update the order in the database
    async update(data) {
        
        try{
            
            const { updates, order_id } = data;

            let stmt;
            let values = [];

            if(Array.isArray(updates)){

                let numCols = updates.length;
                
                stmt = `UPDATE orders SET `;

               updates.forEach((item, index) => {
                   if(index < numCols - 1) {
                    stmt += `${item.column} = $${index +1}, `;
                    values.push(item.value);
                   } else {
                    stmt += `${item.column} = $${index +1} `;
                    values.push(item.value);
                   }
               })

               stmt += `WHERE order_id = $${numCols + 1} RETURNING *;`;
               values.push(parseInt(order_id));

            } else {

                // Update the record
                const { orderId, column, value } = data;
                stmt = `UPDATE orders SET $2 = $3 WHERE order_id = $1 RETURNING *;`;
                values = [orderId, column, value];

            }

            // Execute the statement
            const result = await db.query(stmt, values);
            
            if(result.rows?.length){
                return result.rows;
            }
            
            return null;
            
        } catch(err) {
            
            throw new Error(err);
        }
    }

    // Delete an order in the database
    async deleteById() {
        try{

            // Generate the statmenet to execute and then run it
            const stmt = "DELETE FROM orders WHERE order_id = $1 RETURNING *;";
            const values = [this.order_id];

            const result = await db.query(stmt, values);
            if(result.rows?.length){
                return result.rows;
            }

            return null;

        } catch(err) {
            throw new Error(err);
        }
    }

}