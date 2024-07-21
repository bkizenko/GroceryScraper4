import fs from 'fs';

// Read the JSON file
fs.readFile('prices.json', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  // Parse the JSON data
  const pricesData = JSON.parse(data);
  // Print the data
  console.log(pricesData.data);
});

