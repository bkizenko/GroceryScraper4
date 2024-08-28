const express = require('express'); // Import the express package
const fs = require('fs'); // Import the file system module
const cors = require('cors'); // Import the cors package
const { exec } = require('child_process'); // Import the child_process module
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
  const { stores } = req.body;

  if (!stores || stores.length === 0) {
    res.status(400).send('No stores provided');
    return;
  }

  const urls = stores.map(store => store.website).filter(url => url !== 'No website available');
  if (urls.length === 0) {
    res.status(400).send('No valid store websites provided');
    return;
  }

  const output_file = 'prices.json';

  exec(`python scrape.py ${urls.join(' ')} ${output_file}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing scrape.py: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      res.status(500).send('Error extracting prices');
      return;
    }
    console.log(`stdout: ${stdout}`);
    res.status(200).send('Prices extracted and saved');
  });
});

app.listen(port, () => { // Start the server and listen on the defined port
  console.log(`Server is running on http://localhost:${port}`); // Log a message when the server starts
});