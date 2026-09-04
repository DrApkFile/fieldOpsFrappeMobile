import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

/** One-shot read of the device's current GPS fix, for on-screen distance checks (not attendance clock-in, which has its own capture flow with a selfie/retry UI). */
export const useCurrentLocation = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!cancelled) {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        }
      } catch (e) {
        // Non-fatal — callers just don't get a distance to show.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return coords;
};
