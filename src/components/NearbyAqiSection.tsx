import React, { useState } from 'react';
import { MapPin, Navigation, Search, Radio, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { NearbyLocationItem } from '../types';

interface NearbyAqiSectionProps {
  currentCity: string;
  nearbyList: NearbyLocationItem[];
  onSelectStation: (stationId: string, locationName: string) => void;
  onUseMyLocation: () => void;
  onSearchCity: (query: string) => void;
  onOpenMap: () => void;
  isLocating: boolean;
}

export const NearbyAqiSection: React.FC<NearbyAqiSectionProps> = ({
  currentCity,
  nearbyList,
  onSelectStation,
  onUseMyLocation,
  onSearchCity,
  onOpenMap,
  isLocating
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchCity(searchInput.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Local Grid Monitoring
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
            <span>Nearby Air Quality</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              📍 {currentCity}
            </span>
          </h3>
        </div>

        {/* Search & Location Permission Button */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search area or city..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </form>

          <button
            onClick={onUseMyLocation}
            disabled={isLocating}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting...' : 'Use My Location'}</span>
          </button>

          <button
            onClick={onOpenMap}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <span>View Full Map</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="mt-4">
        {nearbyList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <AlertCircle className="w-5 h-5 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700">Data unavailable for this specific search query.</p>
            <p className="mt-1">Sensor telemetry may be offline or unmonitored. Try another city or click "Use My Location".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nearbyList.map((loc) => {
              const tierEmoji = loc.tier === 'LOW' ? '🟢' : loc.tier === 'MEDIUM' ? '🟡' : '🔴';
              const cardBorder =
                loc.tier === 'LOW'
                  ? 'hover:border-emerald-300'
                  : loc.tier === 'MEDIUM'
                  ? 'hover:border-amber-300'
                  : 'hover:border-rose-300';

              return (
                <button
                  key={loc.id}
                  onClick={() => onSelectStation(loc.id, loc.full_name)}
                  className={`text-left p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${cardBorder}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {loc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{loc.city}</span>
                        <span className="text-slate-300">·</span>
                        <span>{loc.distance}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 leading-none">
                        {loc.aqi}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 block mt-0.5">
                        {loc.tier} {tierEmoji}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[170px]" title={loc.sensor_type}>
                      {loc.sensor_type.split(' ')[0]} Sensor
                    </span>
                    <span className="text-emerald-700 font-semibold group-hover:underline">
                      Inspect station ›
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
