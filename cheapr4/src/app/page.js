"use client"; // Add this directive

import { useState } from "react";
import MapComponent from "./MapComponent.mjs";
import GroceryInput from "./GroceryInput";

export default function Home() {
  // State to store fetched data
  const [data, setData] = useState(null);
  // State to store the selected address
  const [address, setAddress] = useState(null);
  const [groceries, setGroceries] = useState([]);

  // Callback function to handle place selection from MapComponent
  const handlePlaceSelected = (place) => {
    setAddress(place.formatted_address);
    // You can also get the coordinates: place.geometry.location.lat(), place.geometry.location.lng()
  };

  // Function to handle button click and fetch data from the server
  const handleClick = async () => {
    console.log("clicked!");
    try {
      const response = await fetch("http://localhost:3001/prices");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleGrocerySubmit = (groceryList) => {
    setGroceries(groceryList);
    console.log("Grocery list submitted:", groceryList);
    // You can send the grocery list to the backend or process it as needed
  };

  const sendNearbyStoresToBackend = async (stores) => {
    try {
      const response = await fetch('http://localhost:3001/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stores }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('Prices extracted and saved');
    } catch (error) {
      console.error('Error sending stores to backend:', error);
    }
  };

  return (
    <div>
      <h1>Cheapr4</h1>
      {/* MapComponent with a callback for place selection */}
      <MapComponent onPlaceSelected={handlePlaceSelected} />
      {/* Button to fetch data */}
      <button id="click-me" onClick={handleClick}>click for prices</button>
      {/* Display the selected address */}
      {address && <p>Selected Address: {address}</p>}
      {/* Display fetched data */}
      {data && (
        <div>
          <h2>Prices:</h2>
          {/* 
            JSON.stringify parameters:
            1. data: The object to be converted to a JSON string
            2. null: A replacer function (not used here, so set to null)
            3. 2: Number of spaces for indentation in the resulting string
          */}
          <pre>{JSON.stringify(data, null, 2)}</pre>

        </div>
      )}
      <GroceryInput onSubmit={handleGrocerySubmit} />
      {groceries.length > 0 && (
        <div>
          <h2>Grocery List:</h2>
          <ul>
            {groceries.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}