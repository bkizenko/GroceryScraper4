import React, { useEffect, useRef, useState } from 'react';

const MapComponent = ({ onPlaceSelected }) => {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const [address, setAddress] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [nearbyStores, setNearbyStores] = useState([]);
  const markersRef = useRef([]);

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

  useEffect(() => {
    if (mapLoaded && mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      });
      setMap(newMap);

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
      autocomplete.bindTo('bounds', newMap);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          console.error('No details available for input: ' + place.name);
          return;
        }

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

  const findNearbyGroceryStores = (location, map) => {
    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: location,
      radius: '20000',
      type: ['grocery_or_supermarket']
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const detailedStores = [];
        results.forEach((store, index) => {
          service.getDetails({ placeId: store.place_id }, (placeDetails, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              detailedStores.push({
                ...store,
                website: placeDetails.website || 'No website available',
                isOpen: placeDetails.opening_hours ? placeDetails.opening_hours.isOpen() : 'Unknown'
              });
              if (detailedStores.length === results.length) {
                setNearbyStores(detailedStores);
                sendNearbyStoresToBackend(detailedStores);
                markersRef.current.forEach(marker => marker.setMap(null));
                markersRef.current = detailedStores.map(place => {
                  return new window.google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: place.name
                  });
                });
              }
            }
          });
        });
      }
    });
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

  const handleInputChange = (e) => {
    setAddress(e.target.value);
  };

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
      <input 
        ref={inputRef} 
        type="text" 
        placeholder="Enter your address" 
        value={address}
        onChange={handleInputChange}
      />
      <button onClick={handleUseCurrentLocation}>Use Current Location</button>
      <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
      <div>
        <h3>Nearby Grocery Stores (within 20 minutes drive):</h3>
        <ul>
          {nearbyStores.map((store, index) => (
            <li key={index}>
              {store.name} - <a href={store.website} target="_blank" rel="noopener noreferrer">{store.website}</a> - {store.isOpen ? 'Open' : 'Closed'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapComponent;