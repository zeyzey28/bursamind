import type { LineString } from 'geojson';
import type { ServicePoint } from '@/lib/location/servicePoints';

/**
 * OSRM public demo endpoint is used for MVP purposes.
 * Production should use a self-hosted OSRM instance or a managed routing provider.
 */
const OSRM_BASE = 'https://router.project-osrm.org';

// ── Types ────────────────────────────────────────────────────────────────────

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  geometry?: LineString;
}

export interface ServicePointRouteResult {
  servicePoint: ServicePoint;
  distanceMeters: number;
  durationSeconds: number;
  geometry?: LineString;
}

type Coord = { latitude: number; longitude: number };

// ── OSRM raw response shape (partial) ────────────────────────────────────────

interface OsrmRoute {
  distance: number;   // metres
  duration: number;   // seconds
  geometry: LineString;
}

interface OsrmResponse {
  code: string;
  routes?: OsrmRoute[];
}

// ── Core routing call ─────────────────────────────────────────────────────────

/**
 * Fetches a driving route between two coordinates using OSRM.
 * Returns null if the request fails or OSRM returns no route.
 */
export async function getRouteBetweenPoints(
  origin: Coord,
  destination: Coord
): Promise<RouteResult | null> {
  const url =
    `${OSRM_BASE}/route/v1/driving/` +
    `${origin.longitude},${origin.latitude};` +
    `${destination.longitude},${destination.latitude}` +
    `?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!res.ok) {
      console.warn(`[OSRM] HTTP ${res.status} for route request.`);
      return null;
    }

    const json: OsrmResponse = await res.json();

    if (json.code !== 'Ok' || !json.routes?.length) {
      console.warn('[OSRM] No route returned. Code:', json.code);
      return null;
    }

    const route = json.routes[0];
    return {
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      geometry: route.geometry,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[OSRM] Routing request failed:', msg);
    return null;
  }
}

// ── Nearest service point ─────────────────────────────────────────────────────

/**
 * Queries OSRM for each service point and returns the one with the
 * shortest driving duration to the report location. Falls back to
 * distanceMeters if duration is unavailable. Returns null if all requests fail.
 */
export async function findNearestServicePointByRoute(
  reportLocation: Coord,
  servicePoints: ServicePoint[]
): Promise<ServicePointRouteResult | null> {
  if (servicePoints.length === 0) return null;

  // Run all OSRM requests in parallel (safe for MVP point counts ~2-18)
  const results = await Promise.all(
    servicePoints.map(async (sp): Promise<ServicePointRouteResult | null> => {
      const origin: Coord = { latitude: sp.latitude, longitude: sp.longitude };
      const route = await getRouteBetweenPoints(origin, reportLocation);
      if (!route) return null;
      return {
        servicePoint: sp,
        distanceMeters: route.distanceMeters,
        durationSeconds: route.durationSeconds,
        geometry: route.geometry,
      };
    })
  );

  // Filter out failed requests
  const valid = results.filter((r): r is ServicePointRouteResult => r !== null);
  if (valid.length === 0) return null;

  // Sort: primary = durationSeconds asc, secondary = distanceMeters asc
  valid.sort((a, b) => {
    const durDiff = a.durationSeconds - b.durationSeconds;
    if (durDiff !== 0) return durDiff;
    return a.distanceMeters - b.distanceMeters;
  });

  return valid[0];
}

// ── Formatting helpers ────────────────────────────────────────────────────────

/**
 * Formats a distance in meters to a human-readable string.
 * e.g. 850 → "850 m"  |  3200 → "3.2 km"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formats a duration in seconds to a human-readable string in Turkish.
 * e.g. 45 → "1 dk"  |  490 → "8 dk"
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} dk`;
}
