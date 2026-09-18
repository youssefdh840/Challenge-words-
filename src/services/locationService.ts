import { UserLocation } from '../types';

export interface WorldCityCoordinate {
  countryCode: string;
  countryName: string;
  flag: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const WORLD_CITIES_REGISTRY: WorldCityCoordinate[] = [
  { countryCode: 'TN', countryName: 'Tunisia', flag: '🇹🇳', city: 'Tunis', latitude: 36.8065, longitude: 10.1815, timezone: 'Africa/Tunis' },
  { countryCode: 'JP', countryName: 'Japan', flag: '🇯🇵', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { countryCode: 'FR', countryName: 'France', flag: '🇫🇷', city: 'Paris', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { countryCode: 'EG', countryName: 'Egypt', flag: '🇪🇬', city: 'Cairo', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { countryCode: 'BR', countryName: 'Brazil', flag: '🇧🇷', city: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729, timezone: 'America/Sao_Paulo' },
  { countryCode: 'CU', countryName: 'Cuba', flag: '🇨🇺', city: 'Havana', latitude: 23.1136, longitude: -82.3666, timezone: 'America/Havana' },
  { countryCode: 'IS', countryName: 'Iceland', flag: '🇮🇸', city: 'Reykjavik', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik' },
  { countryCode: 'SN', countryName: 'Senegal', flag: '🇸🇳', city: 'Dakar', latitude: 14.7167, longitude: -17.4677, timezone: 'Africa/Dakar' },
  { countryCode: 'IN', countryName: 'India', flag: '🇮🇳', city: 'New Delhi', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata' },
  { countryCode: 'US', countryName: 'United States', flag: '🇺🇸', city: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', city: 'Montreal', latitude: 45.5017, longitude: -73.5673, timezone: 'America/Toronto' },
  { countryCode: 'MX', countryName: 'Mexico', flag: '🇲🇽', city: 'Mexico City', latitude: 19.4326, longitude: -99.1332, timezone: 'America/Mexico_City' },
  { countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', city: 'London', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { countryCode: 'DE', countryName: 'Germany', flag: '🇩🇪', city: 'Berlin', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
  { countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', city: 'Rome', latitude: 41.9028, longitude: 12.4964, timezone: 'Europe/Rome' },
  { countryCode: 'KR', countryName: 'South Korea', flag: '🇰🇷', city: 'Seoul', latitude: 37.5665, longitude: 126.9780, timezone: 'Asia/Seoul' },
  { countryCode: 'AU', countryName: 'Australia', flag: '🇦🇺', city: 'Sydney', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { countryCode: 'MA', countryName: 'Morocco', flag: '🇲🇦', city: 'Marrakech', latitude: 31.6295, longitude: -7.9811, timezone: 'Africa/Casablanca' },
  { countryCode: 'AR', countryName: 'Argentina', flag: '🇦🇷', city: 'Buenos Aires', latitude: -34.6037, longitude: -58.3816, timezone: 'America/Argentina/Buenos_Aires' },
  { countryCode: 'KE', countryName: 'Kenya', flag: '🇰🇪', city: 'Nairobi', latitude: -1.2921, longitude: 36.8219, timezone: 'Africa/Nairobi' },
];

/**
 * Calculates Great-Circle Distance using Haversine formula (km)
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Estimates realistic network round-trip time (ms) based on geographic distance
 * Base overhead + ~0.012 ms per km of fiber propagation + jitter
 */
export function estimatePingMs(distanceKm: number): number {
  const baseOverhead = 22; // local network / TCP handshake floor
  const propagation = distanceKm * 0.0125;
  const jitter = Math.floor(Math.random() * 6);
  return Math.max(15, Math.round(baseOverhead + propagation + jitter));
}

/**
 * Find closest city in registry to given GPS coordinates
 */
export function findClosestCity(lat: number, lon: number): WorldCityCoordinate {
  let closest = WORLD_CITIES_REGISTRY[0];
  let minDistance = Infinity;

  for (const city of WORLD_CITIES_REGISTRY) {
    const dist = calculateHaversineDistanceKm(lat, lon, city.latitude, city.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return closest;
}

class LocationService {
  private currentLocation: UserLocation | null = null;
  private isCapturing = false;
  private listeners: Array<(loc: UserLocation) => void> = [];

  constructor() {
    // Attempt restoring saved location
    try {
      const saved = localStorage.getItem('wc_user_location');
      if (saved) {
        this.currentLocation = JSON.parse(saved);
      } else {
        // Default to origin homeland (Tunisia)
        this.currentLocation = {
          countryCode: 'TN',
          countryName: 'Tunisia',
          city: 'Tunis',
          latitude: 36.8065,
          longitude: 10.1815,
          accuracyMeters: 1000,
          captureMethod: 'ip_fallback',
          flagEmoji: '🇹🇳',
          timezone: 'Africa/Tunis',
          capturedAt: new Date().toISOString(),
        };
      }
    } catch {
      // noop
    }
  }

  public getLocation(): UserLocation {
    if (!this.currentLocation) {
      return {
        countryCode: 'TN',
        countryName: 'Tunisia',
        city: 'Tunis',
        latitude: 36.8065,
        longitude: 10.1815,
        captureMethod: 'manual',
        flagEmoji: '🇹🇳',
        capturedAt: new Date().toISOString(),
      };
    }
    return this.currentLocation;
  }

  public subscribe(fn: (loc: UserLocation) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    if (this.currentLocation) {
      const copy = { ...this.currentLocation };
      this.listeners.forEach((fn) => fn(copy));
      try {
        localStorage.setItem('wc_user_location', JSON.stringify(copy));
      } catch {
        // noop
      }
    }
  }

  /**
   * Captures location using Browser Geolocation API with IP-based fallback
   */
  public async captureLocation(): Promise<UserLocation> {
    if (this.isCapturing) return this.getLocation();
    this.isCapturing = true;

    try {
      // 1. Try Browser Geolocation API
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: false,
              timeout: 6000,
              maximumAge: 120000,
            }
          );
        });

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        const closest = findClosestCity(lat, lon);

        this.currentLocation = {
          countryCode: closest.countryCode,
          countryName: closest.countryName,
          city: closest.city,
          latitude: Number(lat.toFixed(4)),
          longitude: Number(lon.toFixed(4)),
          accuracyMeters: accuracy,
          captureMethod: 'gps',
          flagEmoji: closest.flag,
          timezone: closest.timezone,
          capturedAt: new Date().toISOString(),
        };

        this.notify();
        this.isCapturing = false;
        return this.currentLocation;
      }
    } catch {
      // Geolocation denied or unavailable, fall through to IP detection
    }

    // 2. IP-Based Geolocation Fallback
    try {
      const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3500) });
      if (response.ok) {
        const data = await response.json();
        if (data && data.country_code) {
          const matched = WORLD_CITIES_REGISTRY.find((c) => c.countryCode === data.country_code);

          this.currentLocation = {
            countryCode: data.country_code,
            countryName: data.country_name || matched?.countryName || 'Global Citizen',
            city: data.city || matched?.city || 'Capital',
            latitude: Number((data.latitude || matched?.latitude || 36.8).toFixed(4)),
            longitude: Number((data.longitude || matched?.longitude || 10.2).toFixed(4)),
            ipAddress: data.ip,
            captureMethod: 'ip_fallback',
            flagEmoji: matched?.flag || '🌐',
            timezone: data.timezone || matched?.timezone || 'UTC',
            capturedAt: new Date().toISOString(),
          };

          this.notify();
          this.isCapturing = false;
          return this.currentLocation;
        }
      }
    } catch {
      // noop
    }

    // 3. Fallback to default/current location
    if (!this.currentLocation) {
      this.currentLocation = {
        countryCode: 'TN',
        countryName: 'Tunisia',
        city: 'Tunis',
        latitude: 36.8065,
        longitude: 10.1815,
        captureMethod: 'ip_fallback',
        flagEmoji: '🇹🇳',
        timezone: 'Africa/Tunis',
        capturedAt: new Date().toISOString(),
      };
    }

    this.notify();
    this.isCapturing = false;
    return this.currentLocation;
  }

  /**
   * Manual fallback selection
   */
  public setManualLocation(countryCode: string): UserLocation {
    const city = WORLD_CITIES_REGISTRY.find((c) => c.countryCode === countryCode) || WORLD_CITIES_REGISTRY[0];

    this.currentLocation = {
      countryCode: city.countryCode,
      countryName: city.countryName,
      city: city.city,
      latitude: city.latitude,
      longitude: city.longitude,
      captureMethod: 'manual',
      flagEmoji: city.flag,
      timezone: city.timezone,
      capturedAt: new Date().toISOString(),
    };

    this.notify();
    return this.currentLocation;
  }
}

export const locationService = new LocationService();
