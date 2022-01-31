// Load and configure the env file
require('dotenv').config()

let express = require('express')

// Import the routes for the app
const userRouter = require('./routes/users')
const cartRouter = require('./routes/carts')
const productRouter = require('./routes/products')

// Create the express app server
var app = express()

// JSON config
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ type: 'application/json'}))

// Assign any routes

app.get('/', (req, res) => {
    res.send('Hello World')
})

// Let the apps know about the routes we intend to use
app.use('/users', userRouter);
app.use('/carts', cartRouter);
app.use('products', productRouter);

// handle unknown routes
app.get('*',(req,res,next) => {
    const err = new Error("endpoint not found");
    err.status = 404;
    next(err);
});

// Error Handling
app.use((error, req, res, next) => {

    let statusCode;
    let message;

    // Check for DB related error messages
    if(error.code == 23505){
        statusCode = 400;
        message = "Unable to add record as the data supplied violates uniqueness rules.";
    } else if(error.code == 23503) {
        statusCode = 400;
        message = "Unable to add record as the data supplied violates foreign key rules.";
    } else {
        statusCode = error.status || 500;
        message = error.message || "Internal server error";
    }

    // Send the error back to the callin script
    res.status(statusCode).json({
        status: statusCode,
        message: message,
    });
});

// Set the app to listen on the required port and then export the server
app.listen(3000, () => {
    console.log('server backend started');
})

module.exports = app;