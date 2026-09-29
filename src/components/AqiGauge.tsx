import React from 'react';

interface AqiGaugeProps {
  aqi: number;
  category: string;
  tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  color: string;
  meaning: string;
}

export const AqiGauge: React.FC<AqiGaugeProps> = ({
  aqi,
  category,
  tier,
  color,
  meaning
}) => {
  // SVG Semi-Circle Gauge math
  // Angle from -180 deg to 0 deg (or -90 to 90)
  // Max AQI mapped to 400 for gauge sweep
  const clampedAqi = Math.min(Math.max(aqi, 0), 400);
  const percentage = clampedAqi / 400;
  
  // Calculate dash offset for SVG stroke
  const radius = 90;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half-circle
  const strokeDashoffset = circumference - percentage * circumference;

  const tierEmoji = tier === 'LOW' ? '🟢' : tier === 'MEDIUM' ? '🟡' : '🔴';

  const tierBadgeStyle =
    tier === 'LOW'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : tier === 'MEDIUM'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-rose-50 text-rose-800 border-rose-200';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pollution Level
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
            Air Quality Gauge
          </h3>
        </div>

        {/* 3-Level Simple Tier Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${tierBadgeStyle}`}>
          <span>{tierEmoji}</span>
          <span>{tier}</span>
        </div>
      </div>

      {/* SVG Semi-Circular Meter */}
      <div className="relative flex flex-col items-center justify-center my-4">
        <svg className="w-56 h-32 overflow-visible" viewBox="0 0 220 120">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="30%" stopColor="#84cc16" />
              <stop offset="55%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Gradient Arc */}
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center AQI Value & Label */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            AQI
          </span>
          <span className="text-4xl font-black text-slate-900 tracking-tight leading-none my-0.5">
            {aqi}
          </span>
          <div className="w-16 h-px bg-slate-200 my-1" />
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <span>{category}</span>
            <span>{tierEmoji}</span>
          </span>
        </div>
      </div>

      {/* Scale Range Labels */}
      <div className="flex justify-between items-center px-4 text-[11px] font-semibold text-slate-400 -mt-2">
        <span className="text-emerald-600">0 (Clean)</span>
        <span className="text-amber-500">100</span>
        <span className="text-orange-500">200</span>
        <span className="text-rose-600">400+ (Hazard)</span>
      </div>

      {/* What does this mean? Box */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          What does this mean?
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          {meaning}
        </p>
      </div>
    </div>
  );
};
