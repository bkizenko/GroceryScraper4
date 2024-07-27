"use client"; // Add this directive

import { useState } from "react";
import MapComponent from "./MapComponent.mjs";

export default function Home() {
  // State to store fetched data
  const [data, setData] = useState(null);
  // State to store the selected address
  const [address, setAddress] = useState(null);

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

  return (
    <div>
      <h1>Cheapr4</h1>
      {/* MapComponent with a callback for place selection */}
      <MapComponent onPlaceSelected={handlePlaceSelected} />
      {/* Button to fetch data */}
      <button onClick={handleClick}>Click Me</button>
      {/* Display the selected address */}
      {address && <p>Selected Address: {address}</p>}
      {/* Display fetched data */}
      {data && (
        <div>
          <h2>Prices:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}