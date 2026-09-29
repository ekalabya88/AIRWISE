import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Search, Navigation, AlertCircle, MapPin, RefreshCw, X } from 'lucide-react';
import { StationData } from '../types';

interface InteractiveMapProps {
  onSelectStation: (station: StationData) => void;
  userHomeCity?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onSelectStation,
  userHomeCity = 'Bhubaneswar'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [stations, setStations] = useState<StationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [locating, setLocating] = useState(false);

  // Debounce search input (~250 ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/aqi/stations');
        const data = await res.json();
        // Server already returns strictly sorted A->Z, but we also enforce here:
        const sorted = (data.stations || []).sort((a: StationData, b: StationData) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setStations(sorted);
      } catch (err) {
        console.error('Failed to fetch stations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Filtered & strictly alphabetically sorted stations for autocomplete
  const filteredStations = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return [...stations].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
    }
    const q = debouncedSearch.trim().toLowerCase();
    return stations
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q)
      )
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }, [stations, debouncedSearch]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered initially on user's home city coordinates (Bhubaneswar default: 20.2961, 85.8245)
    const map = L.map(mapContainerRef.current, {
      center: [20.2961, 85.8245],
      zoom: 6,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || stations.length === 0) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    stations.forEach((station) => {
      const aqi = station.aqi ?? station.base_aqi ?? 50;
      const color = station.color || '#10b981';
      const category = station.category || 'Good';
      const mainPollutant = station.main_pollutant || 'PM2.5';
      const lastUpdated = station.last_updated || '2 minutes ago';

      // Custom HTML Marker showing BOTH AQI Number and Category Label (official CPCB scale)
      const markerHtml = `
        <div style="
          background-color: ${color};
          color: white;
          padding: 3px 6px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
          border: 2px solid white;
          white-space: nowrap;
          cursor: pointer;
        ">
          <span style="font-size: 12px;">${aqi}</span>
          <span style="font-size: 9px; opacity: 0.95; font-weight: 600; text-transform: uppercase;">${category}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'cpcb-map-marker',
        iconSize: [80, 26],
        iconAnchor: [40, 13]
      });

      const marker = L.marker([station.lat, station.lon], { icon: customIcon }).addTo(map);

      // Popup with full details
      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; min-width: 180px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
            ${station.name}
          </div>
          <div style="color: #64748b; font-size: 10px; margin-bottom: 6px;">
            ${station.city} · ${station.state}
          </div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin: 4px 0;">
            <span style="font-size: 20px; font-weight: 900; color: ${color};">${aqi} AQI</span>
            <span style="font-weight: 700; color: #334155; font-size: 11px;">(${category})</span>
          </div>
          <div style="font-size: 10px; color: #475569; margin-top: 4px;">
            <strong>Main Pollutant:</strong> ${mainPollutant}
          </div>
          <div style="font-size: 10px; color: #475569;">
            <strong>Last Updated:</strong> ${lastUpdated}
          </div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8;">
            ${station.sensor_type}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedStation(station);
        onSelectStation(station);
      });

      markersRef.current[station.id] = marker;
    });

    // If stations exist, adjust view if Bhubaneswar is in stations
    const bbsr = stations.find((s) => s.city.toLowerCase().includes('bhubaneswar'));
    if (bbsr) {
      map.setView([bbsr.lat, bbsr.lon], 11);
    }
  }, [stations, onSelectStation]);

  // Handle Station selection from search autocomplete
  const handleSelectStation = (station: StationData) => {
    setSelectedStation(station);
    setSearchTerm(station.name);
    setShowDropdown(false);

    const map = mapInstanceRef.current;
    if (map) {
      map.setView([station.lat, station.lon], 14, { animate: true });
      const marker = markersRef.current[station.id];
      if (marker) {
        marker.openPopup();
      }
    }

    onSelectStation(station);
  };

  // "Use my location" button logic
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const map = mapInstanceRef.current;

        // Find nearest station
        let nearest: StationData | null = null;
        let minDist = Infinity;

        stations.forEach((s) => {
          const dist = Math.hypot(s.lat - latitude, s.lon - longitude);
          if (dist < minDist) {
            minDist = dist;
            nearest = s;
          }
        });

        if (map && nearest) {
          map.setView([(nearest as StationData).lat, (nearest as StationData).lon], 14, { animate: true });
          const marker = markersRef.current[(nearest as StationData).id];
          if (marker) {
            marker.openPopup();
          }
          setSelectedStation(nearest);
          onSelectStation(nearest);
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Highlight matched query substring helper
  const renderHighlighted = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-emerald-200 text-emerald-950 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col space-y-4">
      {/* Search Bar Above Map */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search station or city (Alphabetical A→Z)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && debouncedSearch && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-64 overflow-y-auto z-[1000] divide-y divide-slate-100">
              {filteredStations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  <span>No matching location found</span>
                </div>
              ) : (
                filteredStations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleSelectStation(station)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {renderHighlighted(station.name, debouncedSearch)}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {station.city}, {station.state} · {station.sensor_type}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white"
                        style={{ backgroundColor: station.color || '#10b981' }}
                      >
                        {station.aqi ?? station.base_aqi} AQI
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Use My Location Button */}
        <button
          onClick={handleUseMyLocation}
          disabled={locating}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Locating...' : 'Use My Location'}</span>
        </button>
      </div>

      {/* Map Legend: Official CPCB AQI Scale */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 font-medium">
        <span className="text-xs font-bold text-slate-700">CPCB AQI Scale:</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#10b981]" /> Good (0-50)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#84cc16]" /> Satisfactory (51-100)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#eab308]" /> Moderate (101-200)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#f97316]" /> Poor (201-300)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#ef4444]" /> Very Poor (301-400)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#991b1b]" /> Severe (401-500+)
        </span>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative w-full h-[450px] sm:h-[520px] rounded-xl overflow-hidden border border-slate-200">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Station Quick Floater */}
        {selectedStation && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-xl z-[500] animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Selected Station</span>
                <h4 className="text-xs font-bold text-slate-900">{selectedStation.name}</h4>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900">
                AQI: {selectedStation.aqi ?? selectedStation.base_aqi} ({selectedStation.category})
              </span>
              <span className="text-[10px] text-slate-500">{selectedStation.last_updated}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
