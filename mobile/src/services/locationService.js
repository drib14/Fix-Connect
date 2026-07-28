const LOCATIONIQ_TOKEN =
  process.env.EXPO_PUBLIC_LOCATIONIQ_ACCESS_TOKEN ||
  "pk.e31e6705bd87772aa6b6ab21a599c867";

/**
 * Real-time autocomplete search using LocationIQ API
 * @param {string} query Search input
 * @returns {Promise<Array>} List of location suggestions
 */
export const searchAddressLocationIQ = async (query) => {
  if (!query || query.trim().length < 3) return [];

  try {
    const url = `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_TOKEN}&q=${encodeURIComponent(
      query.trim()
    )}&limit=5&countrycodes=ph&format=json`;

    const response = await fetch(url);
    if (!response.ok) {
      // Try fallback without country restriction if countrycode fails
      const fallbackUrl = `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_TOKEN}&q=${encodeURIComponent(
        query.trim()
      )}&limit=5&format=json`;
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) return [];
      const fallbackData = await fallbackRes.json();
      return Array.isArray(fallbackData) ? fallbackData : [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("[LocationIQ Search Warning]:", error.message);
    return [];
  }
};

/**
 * Reverse Geocode coordinates to readable address using LocationIQ
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {Promise<string>} Formatted address string
 */
export const reverseGeocodeLocationIQ = async (lat, lon) => {
  try {
    const url = `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_TOKEN}&lat=${lat}&lon=${lon}&format=json`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return (
        data.display_name ||
        `${data.address?.name || ""}, ${data.address?.city || ""}, ${data.address?.country || ""}`
      );
    }
  } catch (error) {
    console.warn("[LocationIQ Reverse Warning]:", error.message);
  }
  return `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
};

/**
 * Get device/browser current GPS position and resolve to LocationIQ address
 * @returns {Promise<{address: string, coordinates: [number, number]}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await reverseGeocodeLocationIQ(latitude, longitude);
          resolve({
            address,
            coordinates: [longitude, latitude],
          });
        },
        (error) => {
          console.warn("[Geolocation Error]:", error.message);
          // Fallback location (Manila, Philippines)
          const fallbackLat = 14.5995;
          const fallbackLng = 120.9842;
          resolve({
            address: "Manila, Metro Manila, Philippines",
            coordinates: [fallbackLng, fallbackLat],
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      // Default fallback
      resolve({
        address: "Manila, Metro Manila, Philippines",
        coordinates: [120.9842, 14.5995],
      });
    }
  });
};
