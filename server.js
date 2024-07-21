const express = require('express'); // Import the express package
const fs = require('fs'); // Import the file system module
const cors = require('cors'); // Import the cors package
const app = express(); // Create an instance of an Express application
const port = 3001; // Define the port number the server will listen on

app.use(cors()); // Enable CORS for all routes

// Endpoint to serve the JSON data
app.get('/prices', (req, res) => { // Define a GET route for '/prices'
  fs.readFile('prices.json', (err, data) => { // Read the 'prices.json' file
    if (err) { // Check for errors during file reading
      res.status(500).send('Error reading file'); // Send a 500 status code if there's an error
      return; // Exit the function if there's an error
    }
    const pricesData = JSON.parse(data); // Parse the JSON data from the file
    res.json(pricesData); // Send the parsed data as a JSON response
  });
});

app.listen(port, () => { // Start the server and listen on the defined port
  console.log(`Server is running on http://localhost:${port}`); // Log a message when the server starts
});
