"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Search,
  Check,
  RefreshCw,
  X,
} from "lucide-react";
import { searchLocations, reverseGeocodeCoords, GeocodeResult } from "@/lib/geocoding";
import "leaflet/dist/leaflet.css";

interface GoogleMapLocationPickerProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // Center of India
const DEFAULT_ZOOM = 5;

export default function GoogleMapLocationPicker({
  value,
  onChange,
  placeholder = "e.g. Gram Morena, Madhya Pradesh or Ward 12, Jaipur",
  className = "",
}: GoogleMapLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState<"map" | "manual">("map");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Search & suggestions state
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Handle reverse geocoding when pin moves
  const handleReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setReverseGeocoding(true);
    setSelectedCoords({ lat, lng });
    try {
      const address = await reverseGeocodeCoords(lat, lng);
      if (address) {
        setQuery(address);
        onChangeRef.current(address);
      }
    } catch (err) {
      console.warn("Reverse geocoding error:", err);
    } finally {
      setReverseGeocoding(false);
    }
  }, []);

  // Initialize interactive Leaflet map
  useEffect(() => {
    if (activeTab !== "map" || !mapContainerRef.current) return;

    let isMounted = true;

    async function loadLeafletMap() {
      try {
        const L = (await import("leaflet")).default;

        if (!isMounted || !mapContainerRef.current) return;

        // Custom pin icon using Leaflet DivIcon
        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="
              width: 34px;
              height: 34px;
              background: #4F46E5;
              color: white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            ">
              <svg style="transform: rotate(45deg); width: 16px; height: 16px;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3.5" fill="white"></circle>
              </svg>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        // Clean up any existing map instance on container
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
        });

        // OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Draggable Marker
        const marker = L.marker([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], {
          icon: customIcon,
          draggable: true,
        }).addTo(map);

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;

        // Map Click Listener
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          handleReverseGeocode(lat, lng);
        });

        // Marker Drag End Listener
        marker.on("dragend", () => {
          const latLng = marker.getLatLng();
          handleReverseGeocode(latLng.lat, latLng.lng);
        });

        setMapLoaded(true);

        // Trigger resize after rendering
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 200);
      } catch (err) {
        console.error("Leaflet initialization failed:", err);
      }
    }

    loadLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, handleReverseGeocode]);

  // Handle Autocomplete Search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(val);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  // Select place from suggestions list
  const handleSelectSuggestion = (place: GeocodeResult) => {
    setQuery(place.display_name);
    onChange(place.display_name);
    setSelectedCoords({ lat: place.lat, lng: place.lon });
    setShowDropdown(false);
    setSuggestions([]);

    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([place.lat, place.lon], 15);
      markerInstanceRef.current.setLatLng([place.lat, place.lon]);
    }
  };

  // GPS Location detector
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const { latitude: lat, longitude: lng } = pos.coords;

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerInstanceRef.current.setLatLng([lat, lng]);
        }

        handleReverseGeocode(lat, lng);
      },
      (err) => {
        setLocatingUser(false);
        console.warn("Geolocation error:", err);
        alert("Unable to fetch your current GPS location. Please enter or search your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tab Switcher & Quick GPS Action */}
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
            <span>Map Pin & Search</span>
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

      {/* Search Input & Suggestions */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="input pl-10 pr-10 text-base py-3 font-medium text-gray-800 w-full"
        />

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5">
          {isSearching || reverseGeocoding ? (
            <RefreshCw size={16} className="animate-spin text-indigo-500" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("");
                setSuggestions([]);
                setShowDropdown(false);
              }}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={item.placeId}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50/70 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
              >
                <MapPin size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                <span className="text-gray-800 font-medium line-clamp-2">
                  {item.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map display */}
      {activeTab === "map" && (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
            <div
              ref={mapContainerRef}
              className="w-full h-72 sm:h-80 z-0"
              style={{ minHeight: "280px" }}
            />

            {!mapLoaded && (
              <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-500">
                <RefreshCw size={24} className="animate-spin text-indigo-500" />
                <span className="text-xs font-semibold">Loading Map…</span>
              </div>
            )}

            {/* Map helper hint */}
            {mapLoaded && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-md text-xs text-gray-700 flex items-center gap-2 pointer-events-none z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span>Click anywhere or drag the pin to pinpoint the exact site</span>
              </div>
            )}
          </div>
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
