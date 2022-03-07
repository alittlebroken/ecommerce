// Load and configure the env file
require('dotenv').config()

let express = require('express')

// Cors import
const cors = require('cors');

// Import the authentication module
require('./config/passport')

// Import the routes for the app
const userRouter = require('./routes/users')
const cartRouter = require('./routes/carts')
const productRouter = require('./routes/products')
const orderRouter = require('./routes/orders')
const authRouter = require('./routes/auth')
const searchRouter = require('./routes/search')
const checkoutRouter = require('./routes/checkout')
const fullfillmentRouter = require('./routes/fullfillment');
const bodyParser = require('body-parser');

// Swagger API Documenting
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Create the express app server
const app = express()

// Apply cors
app.use(cors);

// Swagger definition and config
const swaggerDefinition = {
    info: {
        title: "eCommerce API docs",
        version: "1.0.0",
        description: "Documenting the API used for the eCommerce backend"
    },
    host: 'localhost:3000',
    basePath: '/'
}

const swaggerOptions = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./routes/*.js']
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

// JSON config
app.use('/fulfill/order', bodyParser.raw({ type: 'application/json'} ))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ type: 'application/json'}))

// Assign any routes

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Let the apps know about the routes we intend to use
app.use('/fulfill', fullfillmentRouter);
app.use('/users', userRouter);
app.use('/carts', cartRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/auth', authRouter);
app.use('/search', searchRouter)
app.use('/checkout', checkoutRouter);


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
        message = "Unable to process record as uniqueness rules were violated.";
    } else if(error.code == 23503) {
        statusCode = 400;
        message = "Unable to process record as foreign key rules were violated.";
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

module.exports = app;

/*
// Set the app to listen on the required port and then export the server
app.listen(3000, () => {
    console.log('server backend started');
})
*/