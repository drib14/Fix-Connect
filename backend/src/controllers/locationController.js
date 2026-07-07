/**
 * Location Controller
 * Proxies geocoding requests to LocationIQ API to keep API keys server-side.
 */

const LOCATIONIQ_BASE = 'https://us1.locationiq.com/v1';

/**
 * GET /api/location/search?q=address
 * Forward geocoding (address -> coordinates).
 */
exports.searchAddress = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    const url = `${LOCATIONIQ_BASE}/search.php?key=${process.env.LOCATIONIQ_ACCESS_TOKEN}&q=${encodeURIComponent(q)}&format=json&countrycodes=ph&limit=5`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Geocoding failed.', error: data });
    }

    const results = data.map(item => ({
      place_id: item.place_id,
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
    }));

    res.json({ results });
  } catch (error) {
    console.error('Search address error:', error);
    res.status(500).json({ message: 'Failed to search address.' });
  }
};

/**
 * GET /api/location/reverse?lat=x&lon=y
 * Reverse geocoding (coordinates -> address).
 */
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const url = `${LOCATIONIQ_BASE}/reverse.php?key=${process.env.LOCATIONIQ_ACCESS_TOKEN}&lat=${lat}&lon=${lon}&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Reverse geocoding failed.', error: data });
    }

    res.json({
      display_name: data.display_name,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      address: data.address,
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ message: 'Failed to reverse geocode.' });
  }
};
