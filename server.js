const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Endpoint to serve the JSON data
app.get('/prices', (req, res) => {
  fs.readFile('prices.json', (err, data) => {
    if (err) {
      res.status(500).send('Error reading file');
      return;
    }
    const pricesData = JSON.parse(data);
    res.json(pricesData);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});