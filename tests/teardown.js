const db = require('../db/db')

// Clean up the users table after the tests have been run
after('Test Teardown', async () => {
    await db.cleanTable("carts_products");
    await db.cleanTable("carts");
    await db.cleanTable("orders_products");
    await db.cleanTable("orders");
    await db.cleanTable("products_categories");
    await db.cleanTable("products");
    await db.cleanTable("categories");
    await db.cleanTable("users");
});