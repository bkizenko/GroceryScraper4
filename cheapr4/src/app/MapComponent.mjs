import React, { useEffect, useRef, useState } from 'react';

const MapComponent = ({ onPlaceSelected }) => {
  const mapRef = useRef(null); // Reference to the map container
  const inputRef = useRef(null); // Reference to the input field
  const [address, setAddress] = useState(''); // State to store the address
  const [mapLoaded, setMapLoaded] = useState(false); // State to track if the map is loaded
  const [map, setMap] = useState(null); // State to store the map instance
  const [nearbyStores, setNearbyStores] = useState([]); // State to store nearby grocery stores
  const markersRef = useRef([]); // Reference to store markers

  // Load the Google Maps API script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAxuq9_dntm1P2OM3NArO2xhu9HA-zsPqQ&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Initialize the map and autocomplete
  useEffect(() => {
    if (mapLoaded && mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      });
      setMap(newMap);

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
      autocomplete.bindTo('bounds', newMap);

      // Listener for place selection from autocomplete
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          console.error('No details available for input: ' + place.name);
          return;
        }

        // Center the map on the selected place
        if (place.geometry.viewport) {
          newMap.fitBounds(place.geometry.viewport);
        } else {
          newMap.setCenter(place.geometry.location);
          newMap.setZoom(17);
        }

        setAddress(place.formatted_address);
        onPlaceSelected(place);
        findNearbyGroceryStores(place.geometry.location, newMap);
      });
    }
  }, [mapLoaded, map, onPlaceSelected]);

  // Function to find nearby grocery stores
  const findNearbyGroceryStores = (location, map) => {
    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: location,
      radius: '20000', // 20km radius (approximate for 20 minutes drive)
      type: ['grocery_or_supermarket']
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        // Use Distance Matrix to filter stores within 20 minutes drive
        const origins = [location];
        const destinations = results.map(place => place.geometry.location);
        const distanceMatrixService = new window.google.maps.DistanceMatrixService();
        distanceMatrixService.getDistanceMatrix(
          {
            origins: origins,
            destinations: destinations,
            travelMode: 'DRIVING',
            unitSystem: window.google.maps.UnitSystem.METRIC,
          },
          (response, status) => {
            if (status === 'OK') {
              const withinTwentyMinutes = response.rows[0].elements
                .map((element, index) => ({
                  store: results[index],
                  duration: element.duration.value
                }))
                .filter(item => item.duration <= 1200) // 1200 seconds = 20 minutes
                .map(item => item.store);
              
              setNearbyStores(withinTwentyMinutes);
              // Clear previous markers and set new ones
              markersRef.current.forEach(marker => marker.setMap(null));
              markersRef.current = withinTwentyMinutes.map(place => {
                return new window.google.maps.Marker({
                  map: map,
                  position: place.geometry.location,
                  title: place.name
                });
              });
            }
          }
        );
      }
    });
  };

  // Handle input change
  const handleInputChange = (e) => {
    setAddress(e.target.value);
  };

  // Handle "Use Current Location" button click
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(currentLocation);
        map.setZoom(17);
        findNearbyGroceryStores(currentLocation, map);
      }, error => {
        console.error('Error getting current location:', error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div>
      {/* Input field for address */}
      <input 
        ref={inputRef} 
        type="text" 
        placeholder="Enter your address" 
        value={address}
        onChange={handleInputChange}
      />
      {/* Button to use current location */}
      <button onClick={handleUseCurrentLocation}>Use Current Location</button>
      {/* Map container */}
      <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
      {/* List of nearby grocery stores */}
      <div>
        <h3>Nearby Grocery Stores (within 20 minutes drive):</h3>
        <ul>
          {nearbyStores.map((store, index) => (
            <li key={index}>{store.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapComponent;