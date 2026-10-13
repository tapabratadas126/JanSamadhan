// Geocoding helper using LocationIQ API with fallback to Nominatim (OpenStreetMap)

const LOCATIONIQ_KEY =
  process.env.NEXT_PUBLIC_GEOCODING_API_KEY ||
  process.env.NEXT_PUBLIC_LOCATIONIQ_KEY ||
  "6ace4fbc5a778588662774lkd530cd6";

export interface GeocodeResult {
  placeId: string;
  display_name: string;
  lat: number;
  lon: number;
}

/**
 * Forward geocoding: search an address or place name to get coordinates and suggestions
 */
export async function searchLocations(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim();

  // Try LocationIQ Autocomplete/Search first
  if (LOCATIONIQ_KEY) {
    try {
      const url = `https://api.locationiq.com/v1/autocomplete?key=${encodeURIComponent(
        LOCATIONIQ_KEY
      )}&q=${encodeURIComponent(trimmed)}&limit=6&countrycodes=in&format=json`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((item: any) => ({
            placeId: String(item.place_id || Math.random()),
            display_name: item.display_name || item.name || "",
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          }));
        }
      }
    } catch (e) {
      console.warn("LocationIQ search failed, trying fallback:", e);
    }
  }

  // Fallback to OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      trimmed
    )}&format=json&addressdetails=1&limit=6&countrycodes=in`;

    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en,hi",
        "User-Agent": "JanSamadhan/1.0",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          placeId: String(item.place_id),
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }));
      }
    }
  } catch (err) {
    console.warn("Nominatim fallback failed:", err);
  }

  return [];
}

/**
 * Reverse geocoding: convert latitude and longitude to a human-readable location address
 */
export async function reverseGeocodeCoords(lat: number, lon: number): Promise<string | null> {
  // Try LocationIQ reverse geocode
  if (LOCATIONIQ_KEY) {
    try {
      const url = `https://us1.locationiq.com/v1/reverse?key=${encodeURIComponent(
        LOCATIONIQ_KEY
      )}&lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch (e) {
      console.warn("LocationIQ reverse failed, trying fallback:", e);
    }
  }

  // Fallback to Nominatim reverse
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en,hi",
        "User-Agent": "JanSamadhan/1.0",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch (err) {
    console.warn("Nominatim reverse fallback error:", err);
  }

  return null;
}
