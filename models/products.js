// Impoirt required packages
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

    // Find a product by name
    static async search (data) {
        try{

            const { name } = data;

            console.log(name)

            const stmt = "SELECT * FROM products WHERE name LIKE $1;";
            const values = ['%' + name + '%'];

            // Execute the statement
            const result = await db.query(stmt, values);

            console.log(result.rows.length)

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

};