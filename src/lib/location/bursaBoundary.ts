/**
 * Bursa province boundary helpers.
 *
 * This is an MVP approximation.
 * Production should use official Bursa province GeoJSON boundary.
 */

export const BURSA_CENTER = { latitude: 40.195, longitude: 29.060 };

// Approximate bounding box for Bursa province
const BURSA_BBOX = {
  latMin: 39.80,
  latMax: 40.75,
  lngMin: 28.10,
  lngMax: 30.25,
};

/**
 * Returns true if the given coordinates fall within the Bursa bounding box.
 */
export function isInsideBursa(latitude: number, longitude: number): boolean {
  return (
    latitude >= BURSA_BBOX.latMin &&
    latitude <= BURSA_BBOX.latMax &&
    longitude >= BURSA_BBOX.lngMin &&
    longitude <= BURSA_BBOX.lngMax
  );
}
