import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Select = styled.select`
  width: 100%;
  padding: 12px;
  background: var(--bg-dark);
  color: var(--text-main);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
  margin-bottom: 15px;

  &:focus {
    border-color: var(--primary-color);
  }
`;

const PHLocationPicker = ({ onLocationChange }) => {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Fetch Regions
  useEffect(() => {
    axios.get('https://psgc.gitlab.io/api/regions/')
      .then(res => setRegions(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch Provinces when Region changes
  useEffect(() => {
    if (selectedRegion) {
      axios.get(`https://psgc.gitlab.io/api/regions/${selectedRegion}/provinces/`)
        .then(res => {
          setProvinces(res.data);
          setSelectedProvince('');
          setCities([]);
          setSelectedCity('');
        })
        .catch(err => console.error(err));
    }
  }, [selectedRegion]);

  // Fetch Cities when Province changes
  useEffect(() => {
    if (selectedProvince) {
      axios.get(`https://psgc.gitlab.io/api/provinces/${selectedProvince}/cities-municipalities/`)
        .then(res => {
          setCities(res.data);
          setSelectedCity('');
        })
        .catch(err => console.error(err));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedRegion && selectedProvince && selectedCity) {
      const regionName = regions.find(r => r.code === selectedRegion)?.name || '';
      const provinceName = provinces.find(p => p.code === selectedProvince)?.name || '';
      const cityName = cities.find(c => c.code === selectedCity)?.name || '';

      onLocationChange({ region: regionName, province: provinceName, city: cityName });
    }
  }, [selectedRegion, selectedProvince, selectedCity, regions, provinces, cities, onLocationChange]);

  return (
    <>
      <Select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} required>
        <option value="">Select Region</option>
        {regions.map((region) => (
          <option key={region.code} value={region.code}>{region.name}</option>
        ))}
      </Select>

      <Select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} disabled={!selectedRegion} required>
        <option value="">Select Province</option>
        {provinces.map((province) => (
          <option key={province.code} value={province.code}>{province.name}</option>
        ))}
      </Select>

      <Select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} required>
        <option value="">Select City/Municipality</option>
        {cities.map((city) => (
          <option key={city.code} value={city.code}>{city.name}</option>
        ))}
      </Select>
    </>
  );
};

export default PHLocationPicker;
