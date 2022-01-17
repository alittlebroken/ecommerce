// Load and configure the env file
require('dotenv').config()

let express = require('express')

// Import the routes for the app
const userRouter = require('./routes/users')

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

// Set the app to know about the routers and a ssign a specific URI enpoint for them
app.use('/users', userRouter);

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
        message = "The requested data could not be added due to violating uniquness rules";
    } else {
        statusCode = error.status || 500;
        message = error.message || "Internal server error";
    }

    // Output the error to the log
    console.log({ "status": statusCode, "message": message });

    // Send the error back to the callin script
    res.status(statusCode).json({
        error: {
            status: statusCode,
            dbErrorCode: error.code,
            message: message,
        }
    });
});

// Set the app to listen on the required port and then export the server
app.listen(3000, () => {
    console.log('server backend started');
})

module.exports = app;