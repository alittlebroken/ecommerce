var express = require('express')

// Import the routes for the app
const dbTest = require('./routes/db_test.js')

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

app.use('/db_test', dbTest)

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

    res.status(statusCode).json({
        error: {
            status: statusCode,
            dbErrorCode: error.code,
            message: message,
        }
    });
});

app.listen(3000, () => {
    console.log('App listening on port 3000')
})