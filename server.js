// Import the main express app
const app = require('./app');

// Allow us to access the environment vars
require('dotenv').config();

// What port should we run on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));