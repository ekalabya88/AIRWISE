import React from 'react';
import { Wind, Droplets, Thermometer, Radio, Cpu, RefreshCw, Info, CloudSun, AlertTriangle } from 'lucide-react';
import { CurrentAQIResponse } from '../types';

interface LiveAqiWeatherCardProps {
  data: CurrentAQIResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export const LiveAqiWeatherCard: React.FC<LiveAqiWeatherCardProps> = ({
  data,
  loading,
  onRefresh
}) => {
  if (loading || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[360px] animate-pulse">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Connecting to continuous ambient air sensor...</p>
        <span className="text-xs text-slate-400 mt-1">Calibrating particulate and telemetry streams</span>
      </div>
    );
  }

  const { station, aqi, category, tier, pollutants, weather, source, is_sensor_live, last_updated } = data;

  const tierEmoji = tier === 'LOW' ? '🟢' : tier === 'MEDIUM' ? '🟡' : '🔴';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Status Bar: Sensor vs API Telemetry */}
      <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-xs font-bold text-slate-900">
              {station.name}
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-400" />
              <span>Source: {source}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>🟢 Live Data</span>
            <span className="text-slate-400 font-normal">· {last_updated}</span>
          </div>

          <button
            onClick={onRefresh}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
            title="Refresh sensor reading"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body Grid: Air Quality & Weather */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Big AQI and Level Highlight */}
          <div className="lg:col-span-4 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Air Quality
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-6xl font-black text-slate-900 tracking-tight">
                {aqi}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">
                  AQI Index
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  {tierEmoji} {tier} LEVEL
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Category:</span>
              <span className="text-xs font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">
                {category}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Standard CPCB continuous environmental air classification.
            </p>
          </div>

          {/* Middle Column: Weather Information */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-amber-500" />
              <span>Weather & Atmospheric Conditions</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  <span>Weather Condition</span>
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {weather.summary}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-500" />
                  <span>Relative Humidity</span>
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {weather.humidity_formatted}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-teal-500" />
                  <span>Wind Velocity</span>
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {weather.wind_formatted}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Pollutant Sub-Indices */}
          <div className="lg:col-span-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Pollutant Sub-Indices</span>
              <span className="text-[10px] text-slate-400 font-normal">Real-Time Sensor Values</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">PM2.5</span>
                <span className="text-sm font-extrabold text-slate-900">{pollutants.pm25.value}</span>
                <span className="text-[9px] text-slate-400 block">{pollutants.pm25.unit}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">PM10</span>
                <span className="text-sm font-extrabold text-slate-900">{pollutants.pm10.value}</span>
                <span className="text-[9px] text-slate-400 block">{pollutants.pm10.unit}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">NO₂</span>
                <span className="text-sm font-extrabold text-slate-900">{pollutants.no2.value}</span>
                <span className="text-[9px] text-slate-400 block">{pollutants.no2.unit}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">SO₂</span>
                <span className="text-sm font-extrabold text-slate-900">{pollutants.so2.value}</span>
                <span className="text-[9px] text-slate-400 block">{pollutants.so2.unit}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">CO</span>
                <span className="text-sm font-extrabold text-slate-900">{pollutants.co.value}</span>
                <span className="text-[9px] text-slate-400 block">{pollutants.co.unit}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">O₃</span>
                <span className="text-sm font-extrabold text-slate-900">{pollutants.o3.value}</span>
                <span className="text-[9px] text-slate-400 block">{pollutants.o3.unit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
