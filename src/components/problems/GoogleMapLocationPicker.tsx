"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin, Navigation, Search, Check, AlertCircle, RefreshCw } from "lucide-react";

interface GoogleMapLocationPickerProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // Center of India
const DEFAULT_ZOOM = 5;

let isOptionsSet = false;

export default function GoogleMapLocationPicker({
  value,
  onChange,
  placeholder = "e.g. Gram Morena, Madhya Pradesh or Ward 12, Jaipur",
  className = "",
}: GoogleMapLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "manual">("map");
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyDFQLzFatWBkN3kxPF8cvQMiGHKGzZwCDE";

  // Reverse geocode coordinates to get address
  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (!geocoderRef.current) return;
      setReverseGeocoding(true);

      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        setReverseGeocoding(false);
        if (status === "OK" && results && results[0]) {
          const formattedAddress = results[0].formatted_address;
          onChange(formattedAddress);
          if (autocompleteInputRef.current) {
            autocompleteInputRef.current.value = formattedAddress;
          }
        }
      });
    },
    [onChange]
  );

  // Initialize Google Maps
  useEffect(() => {
    if (!apiKey) {
      setMapError("Google Maps API key is not configured.");
      return;
    }

    let isMounted = true;

    async function initMap() {
      try {
        if (!isOptionsSet) {
          setOptions({
            key: apiKey,
            v: "weekly",
          });
          isOptionsSet = true;
        }

        const [{ Map }, { Geocoder }, { Autocomplete }, { Marker }] = await Promise.all([
          importLibrary("maps") as Promise<google.maps.MapsLibrary>,
          importLibrary("geocoding") as Promise<google.maps.GeocodingLibrary>,
          importLibrary("places") as Promise<google.maps.PlacesLibrary>,
          importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
        ]);

        if (!isMounted || !mapContainerRef.current) return;

        const geocoder = new Geocoder();
        geocoderRef.current = geocoder;

        const map = new Map(mapContainerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });
        mapRef.current = map;

        const marker = new Marker({
          map: map,
          draggable: true,
          position: DEFAULT_CENTER,
          title: "Selected Problem Location",
        });
        markerRef.current = marker;

        // On map click -> move marker & reverse geocode
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          marker.setPosition({ lat, lng });
          setSelectedCoords({ lat, lng });
          reverseGeocode(lat, lng);
        });

        // On marker dragend -> reverse geocode
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (!pos) return;
          const lat = pos.lat();
          const lng = pos.lng();
          setSelectedCoords({ lat, lng });
          reverseGeocode(lat, lng);
        });

        // Setup Autocomplete on search input
        if (autocompleteInputRef.current) {
          const autocomplete = new Autocomplete(autocompleteInputRef.current, {
            fields: ["formatted_address", "geometry", "name"],
          });
          autocomplete.bindTo("bounds", map);

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
              return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            map.setCenter({ lat, lng });
            map.setZoom(16);
            marker.setPosition({ lat, lng });
            setSelectedCoords({ lat, lng });

            const address = place.formatted_address || place.name || "";
            onChange(address);
          });
        }

        setMapLoaded(true);
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("Failed to load Google Maps:", err);
        setMapError("Could not load Google Maps. You can still enter the location manually.");
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [apiKey, reverseGeocode, onChange]);

  // Handle GPS / Geolocation
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition) => {
        setLocatingUser(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        setSelectedCoords({ lat, lng });

        if (mapRef.current && markerRef.current) {
          const latLng = { lat, lng };
          mapRef.current.setCenter(latLng);
          mapRef.current.setZoom(17);
          markerRef.current.setPosition(latLng);
        }

        reverseGeocode(lat, lng);
      },
      (err: GeolocationPositionError) => {
        setLocatingUser(false);
        console.warn("Geolocation error:", err);
        alert("Unable to fetch your current location. Please allow location access or search on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tab Switcher & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "map"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <MapPin size={14} />
            <span>Google Maps Pin & Search</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "manual"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>Manual Text Only</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locatingUser}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer shadow-xs disabled:opacity-60"
        >
          {locatingUser ? (
            <RefreshCw size={13} className="animate-spin text-teal-600" />
          ) : (
            <Navigation size={13} className="text-teal-600" />
          )}
          <span>{locatingUser ? "Detecting GPS…" : "Use My Current Location"}</span>
        </button>
      </div>

      {/* Search Input field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          ref={autocompleteInputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input pl-10 pr-10 text-base py-3 font-medium text-gray-800"
        />
        {reverseGeocoding && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <RefreshCw size={16} className="animate-spin text-indigo-500" />
          </div>
        )}
      </div>

      {/* Map display */}
      {activeTab === "map" && (
        <div className="space-y-2">
          {mapError ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{mapError}</p>
                <p className="text-amber-600 mt-0.5">
                  You can type the address directly in the input box above.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
              <div
                ref={mapContainerRef}
                className="w-full h-72 sm:h-80"
                style={{ minHeight: "280px" }}
              />

              {!mapLoaded && (
                <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <RefreshCw size={24} className="animate-spin text-indigo-500" />
                  <span className="text-xs font-semibold">Loading Google Maps…</span>
                </div>
              )}

              {/* Map overlay helper pill */}
              {mapLoaded && (
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-md text-xs text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <span>
                    Click anywhere or drag the pin to pinpoint the exact site
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected location feedback pill */}
      {value && (
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900">
          <Check size={14} className="text-indigo-600 shrink-0" />
          <span className="font-medium truncate">
            <strong>Selected:</strong> {value}
          </span>
          {selectedCoords && (
            <span className="text-[10px] text-indigo-500 ml-auto shrink-0 font-mono">
              ({selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
