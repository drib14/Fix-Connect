import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

type LocationState = {
  latitude: number;
  longitude: number;
  heading: number | null;
};

/**
 * Custom hook for managing device location.
 * Requests permissions and returns current coordinates.
 */
export function useLocation() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enable it in your device settings.');
        setIsLoading(false);
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        heading: currentLocation.coords.heading,
      };

      setLocation(coords);
      setIsLoading(false);
      return coords;
    } catch (err: any) {
      setError('Failed to get location. Please try again.');
      setIsLoading(false);
      return null;
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (result.length > 0) {
        const addr = result[0];
        return [addr.street, addr.district, addr.city, addr.region]
          .filter(Boolean)
          .join(', ');
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  return {
    location,
    error,
    isLoading,
    requestLocation,
    reverseGeocode,
  };
}
