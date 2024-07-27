import React, { useEffect, useRef, useState } from 'react';

const MapComponent = ({ onPlaceSelected }) => {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
    } else {
      const timer = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(timer);
          initMap();
        }
      }, 100);

      return () => clearInterval(timer);
    }
  }, []);

  const initMap = () => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    });

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['grocery_or_supermarket'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        console.error('No details available for input: ' + place.name);
        return;
      }

      map.setCenter(place.geometry.location);
      map.setZoom(15);

      setAddress(place.formatted_address);
      onPlaceSelected(place);
    });
  };

  const handleInputChange = (e) => {
    setAddress(e.target.value);
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
      <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
    </div>
  );
};

export default MapComponent;