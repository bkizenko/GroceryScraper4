const express = require('express'); // Import the express package
const fs = require('fs'); // Import the file system module
const cors = require('cors'); // Import the cors package
const app = express(); // Create an instance of an Express application
const port = 3001; // Define the port number the server will listen on

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Add this line to parse JSON bodies

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

// New endpoint to receive nearby stores and extract prices
app.post('/stores', async (req, res) => {
  // Destructure 'stores' from the request body
  const { stores } = req.body;
  
  // Extract URLs from the stores and filter out those without a website
  const urls = stores.map(store => store.website).filter(url => url !== 'No website available');
  
  // Initialize an array to hold all items
  const allItems = [];

  // Loop through each URL
  for (const url of urls) {
    // Extract prices from the URL (assuming extractPrices is an async function)
    const items = await extractPrices(url);
    // Add the extracted items to the allItems array
    allItems.push(...items);
  }

  // Write the collected items to 'prices.json'
  fs.writeFile('prices.json', JSON.stringify({ data: allItems }), (err) => {
    // If there's an error writing the file, send a 500 status code
    if (err) {
      res.status(500).send('Error writing file');
      return;
    }
    // If successful, send a 200 status code with a success message
    res.status(200).send('Prices extracted and saved');
  });
});

app.listen(port, () => { // Start the server and listen on the defined port
  console.log(`Server is running on http://localhost:${port}`); // Log a message when the server starts
});

// Function to extract prices (simplified for brevity)
const extractPrices = async (url) => {
  // Your existing extract_prices logic here
  // Return the extracted items
};