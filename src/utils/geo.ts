/** Parses the `Outlet.gps` string (stored as `"lat, lng"` by mapOutlet) back into numbers. */
export const parseGps = (gps?: string): { lat: number; lng: number } | null => {
  if (!gps) return null;
  const parts = gps.split(',').map((p) => Number(p.trim()));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null;
  return { lat: parts[0], lng: parts[1] };
};

/** Great-circle distance between two coordinates, in meters (haversine formula). */
export const distanceMeters = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): number => {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Formats a meter distance the way the UI shows it — meters under 1km, otherwise km to 1 decimal. */
export const formatDistance = (meters: number): string =>
  meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
