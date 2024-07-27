"use client"; // Add this directive

import { useState } from "react";
import MapComponent from "./MapComponent.mjs";

export default function Home() {
  const [data, setData] = useState(null);
  const [address, setAddress] = useState(null);

  const handlePlaceSelected = (place) => {
    setAddress(place.formatted_address);
    // You can also get the coordinates: place.geometry.location.lat(), place.geometry.location.lng()
  };

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
      <MapComponent onPlaceSelected={handlePlaceSelected} />
      <button onClick={handleClick}>Click Me</button>
      {address && <p>Selected Address: {address}</p>}
      {data && (
        <div>
          <h2>Prices:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}


