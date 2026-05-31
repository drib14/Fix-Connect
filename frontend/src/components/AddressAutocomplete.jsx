import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Loader } from 'lucide-react';

const AddressAutocomplete = ({
  placeholder = 'Search address or location...',
  initialValue = '',
  onSelectLocation,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync initialValue changes
  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Debounced autocomplete lookup
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const apiKey = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN;
        // Search API with autocomplete parameters
        const url = `https://us1.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(query)}&format=json&limit=5`;
        
        const response = await axios.get(url);
        if (Array.isArray(response.data)) {
          setSuggestions(response.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('LocationIQ Autocomplete error:', err.message);
        // Fallback simulated addresses if API key fails or throttles
        setSuggestions([
          { display_name: `${query}, Manila, Philippines`, lat: '14.5995', lon: '120.9842' },
          { display_name: `${query}, Quezon City, Metro Manila`, lat: '14.6760', lon: '121.0437' },
          { display_name: `${query}, Makati City, Metro Manila`, lat: '14.5547', lon: '121.0244' },
        ]);
        setShowDropdown(true);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce time

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectItem = (item) => {
    setQuery(item.display_name);
    setShowDropdown(false);
    
    // Call the parent resolver returning address, longitude, and latitude
    if (onSelectLocation) {
      onSelectLocation({
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      });
    }
  };

  return (
    <div className="autocomplete-container" ref={dropdownRef}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '40px' }}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // If they clear the search, report blank
            if (e.target.value === '') {
              onSelectLocation({ address: '', lat: 0, lng: 0 });
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
        />
        <MapPin
          size={18}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: loading ? '#cbd5e1' : '#10b981',
          }}
        />
        {loading && (
          <Loader
            size={16}
            className="animate-spin"
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#10b981',
              animation: 'rotateRing 1.5s linear infinite',
            }}
          />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="autocomplete-item"
              onClick={() => handleSelectItem(item)}
            >
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
