// Include some packages
const userModel = require('../models/user');
const orderModel = require('../models/order');
const orderItemModel = require('../models/orderItem.js');
const cartModel = require('../models/carts');
const productModel = require('../models/products');

// Get any needed environment variables
require('dotenv').config();

// Stripe payment system
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

// Fulfill the order in our database
const fulfillOrder = async (orderData) => {

    // Extract the relvant data from the orderData
    const cartId = orderData.client_reference_id;
    const orderTotal = orderData.amount_total;


    try{

        // Get the related cart and it's contents
        const cart = new cartModel({ cartId: cartId });
        const cartOwner = await cart.findById();
        const cartItems = await cart.findAllCartItems();

        // Create a new order
        const order = new orderModel({
            user_id: cartOwner.user_id,
            order_date: new Date().toISOString(),
            order_paid_for: true,
            total_cost: parseFloat(orderTotal / 100)
        });

        // Add the order
        const order_id = await order.create();

        let itemsForOrder = [];
        if(cartItems?.length){
            cartItems.map(item => {
                let cartItem = {
                    product_id: item.product_id,
                    price: item.price,
                    quantity: item.quantity,
                    orderId: order_id.order_id
                };
                itemsForOrder.push(new orderItemModel(cartItem));
            });
        }

        // Add the items to the order
        itemsForOrder.forEach(item => {
            item.create();
        });

        // Remove the cart items
        await cart.removeAllCartItems();

    } catch(err) {
        throw new Error(err);
    }

}

module.exports = { fulfillOrder };