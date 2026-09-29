import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { WeeklyHistoryMetrics, MonthlyHistoryMetrics } from '../types';

interface HistorySectionProps {
  city: string;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ city }) => {
  const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly');
  const [weeklyData, setWeeklyData] = useState<WeeklyHistoryMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyHistoryMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/aqi/history?city=${encodeURIComponent(city)}`);
        const data = await res.json();
        setWeeklyData(data.weekly);
        setMonthlyData(data.monthly);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [city]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Compiling historical atmospheric records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Atmospheric Trends & Analytics</span>
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
            Your Air Quality History
          </h3>
        </div>

        {/* Weekly / Monthly Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setTab('weekly')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'weekly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Recap
          </button>
          <button
            onClick={() => setTab('monthly')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Recap
          </button>
        </div>
      </div>

      {/* WEEKLY RECAP VIEW */}
      {tab === 'weekly' && weeklyData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block">Average AQI</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {weeklyData.average_aqi}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                Moderate Baseline
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block">Lowest AQI</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {weeklyData.lowest_aqi}
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                Cleanest Day
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block">Highest AQI</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                {weeklyData.highest_aqi}
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                Peak Exposure
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block">Average PM2.5</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {weeklyData.average_pm25}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                µg/m³ Mean
              </span>
            </div>
          </div>

          {/* Category Breakdown & Day Counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🟢</span>
                <div>
                  <div className="font-bold text-xs text-slate-900">Low Days (Good)</div>
                  <div className="text-[10px] text-slate-500">AQI ≤ 100</div>
                </div>
              </div>
              <span className="font-black text-xl text-emerald-700">{weeklyData.low_days} days</span>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🟡</span>
                <div>
                  <div className="font-bold text-xs text-slate-900">Medium Days</div>
                  <div className="text-[10px] text-slate-500">AQI 101 - 200</div>
                </div>
              </div>
              <span className="font-black text-xl text-amber-700">{weeklyData.medium_days} days</span>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔴</span>
                <div>
                  <div className="font-bold text-xs text-slate-900">High Days (Severe)</div>
                  <div className="text-[10px] text-slate-500">AQI &gt; 200</div>
                </div>
              </div>
              <span className="font-black text-xl text-rose-700">{weeklyData.high_days} days</span>
            </div>
          </div>

          {/* Simple Line Chart (SVG) */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Weekly AQI Trend Line
              </span>
              <span className="text-[11px] text-slate-500">
                Monday to Sunday Observations
              </span>
            </div>

            <div className="relative h-44 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference gridlines */}
                <line x1="0" y1="40" x2="700" y2="40" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="700" y2="90" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="700" y2="140" stroke="#e2e8f0" strokeDasharray="3 3" />

                {/* Data path */}
                {(() => {
                  const points = weeklyData.daily_trend.map((pt, i) => {
                    const x = 50 + i * 100;
                    // Map aqi 0..160 to y 140..20
                    const y = 140 - Math.min(Math.max(pt.aqi, 0), 160) * 0.75;
                    return { x, y, ...pt };
                  });

                  const pathD = points.reduce(
                    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                    ''
                  );

                  const areaD = `${pathD} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#chartGradient)" />
                      <path d={pathD} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">
                            {p.aqi}
                          </text>
                          <text x={p.x} y={155} textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748b">
                            {p.day}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* MONTHLY RECAP VIEW */}
      {tab === 'monthly' && monthlyData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Monthly Hero Highlight */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
            <div>
              <div className="text-xs uppercase font-bold text-emerald-100 tracking-wider">
                {monthlyData.month_name} Air Quality Summary
              </div>
              <div className="text-3xl font-black mt-1">
                Average AQI: {monthlyData.average_aqi}
              </div>
              <div className="text-xs text-emerald-100 mt-1">
                Previous Month Average: {monthlyData.previous_month_avg} AQI
              </div>
            </div>

            {/* Verified Trend Badge */}
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="text-[10px] uppercase font-bold text-emerald-100">
                Your Air Quality Trend
              </div>
              <div className="text-sm font-extrabold flex items-center gap-1.5 mt-0.5">
                {monthlyData.is_improved ? (
                  <>
                    <ArrowDownRight className="w-4 h-4 text-emerald-200" />
                    <span>{monthlyData.trend_statement}</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-amber-200" />
                    <span>{monthlyData.trend_statement}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block">Highest Pollution Day</span>
              <span className="text-sm font-extrabold text-rose-600 mt-1 block">
                {monthlyData.highest_pollution_day}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block">Lowest Pollution Day</span>
              <span className="text-sm font-extrabold text-emerald-600 mt-1 block">
                {monthlyData.lowest_pollution_day}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block">High-AQI Days</span>
              <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                {monthlyData.high_aqi_days} Days Exceeded
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block">PM2.5 Overall Trend</span>
              <span className="text-sm font-extrabold text-emerald-700 mt-1 block">
                {monthlyData.pm25_trend}
              </span>
            </div>
          </div>

          {/* Monthly 4-Week Progress Bars */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              4-Week Monthly Progression
            </h4>
            <div className="space-y-3">
              {monthlyData.monthly_trend.map((w, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{w.week}</span>
                    <span>{w.aqi} AQI · {w.pm25} µg/m³ PM2.5</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        w.aqi <= 70 ? 'bg-emerald-500' : w.aqi <= 120 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min((w.aqi / 180) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
