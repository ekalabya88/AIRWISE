import React, { useState, useEffect } from 'react';
import { HeartPulse, Sparkles, Check, AlertOctagon, Droplets, Wind, RefreshCw, ShieldAlert, AlertTriangle } from 'lucide-react';
import { HealthAdvisoryData } from '../types';

interface HealthAdvisorySectionProps {
  currentAqi: number;
  currentLocation: string;
  pm25?: number;
  userSensitivity?: string;
  onUpdateSensitivity?: (group: string) => void;
}

const SENSITIVITY_OPTIONS = [
  { id: 'general', label: 'General Public', icon: '👤', desc: 'Standard healthy adults' },
  { id: 'children', label: 'Children', icon: '👶', desc: 'Developing respiratory systems' },
  { id: 'elderly', label: 'Elderly', icon: '👵', desc: 'Cardiovascular susceptibility' },
  { id: 'respiratory', label: 'Respiratory-sensitive', icon: '🫁', desc: 'Asthma, bronchitis, or COPD' },
  { id: 'outdoor_sports', label: 'Outdoor / Sports', icon: '🏃', desc: 'Athletes & high aerobic breathing' },
  { id: 'outdoor_worker', label: 'Outdoor Worker', icon: '👷', desc: 'Extended street & field exposure' }
];

export const HealthAdvisorySection: React.FC<HealthAdvisorySectionProps> = ({
  currentAqi,
  currentLocation,
  pm25 = 36.4,
  userSensitivity = 'general',
  onUpdateSensitivity
}) => {
  const [selectedGroup, setSelectedGroup] = useState(userSensitivity);
  const [advisory, setAdvisory] = useState<HealthAdvisoryData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvisory = async (group: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/advisory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aqi: currentAqi,
          sensitivity_group: group,
          location: currentLocation,
          pm25
        })
      });
      const data = await res.json();
      setAdvisory(data);
    } catch (err) {
      console.error('Failed to generate advisory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory(selectedGroup);
  }, [currentAqi, currentLocation, selectedGroup]);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
    if (onUpdateSensitivity) {
      onUpdateSensitivity(groupId);
    }
  };

  const tierEmoji = currentAqi <= 100 ? '🟢' : currentAqi <= 200 ? '🟡' : '🔴';
  const tierName = currentAqi <= 100 ? 'LOW' : currentAqi <= 200 ? 'MEDIUM' : 'HIGH';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
            <span>Personalized Environmental Health</span>
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
            AI Health Advisory
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
            {tierEmoji} {tierName} AQI: {currentAqi}
          </span>
          <button
            onClick={() => fetchAdvisory(selectedGroup)}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Regenerate advisory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sensitivity Group Selector: "Who are you?" */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Who are you? (Select your sensitivity profile)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SENSITIVITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleGroupSelect(opt.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedGroup === opt.id
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-600'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-xl mb-1">{opt.icon}</div>
              <div className="font-bold text-xs text-slate-900 leading-tight">
                {opt.label}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main AI Advisory Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-slate-50 border border-emerald-200/80">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider">
            AI Advisory for {SENSITIVITY_OPTIONS.find((s) => s.id === selectedGroup)?.label}
          </span>
        </div>

        {loading ? (
          <div className="py-4 text-xs text-slate-500 animate-pulse flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing local particulate levels and generating clinical guidance...</span>
          </div>
        ) : (
          <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
            "{advisory?.advisory || 'Air quality is within normal seasonal bounds. Follow routine hydration and outdoor guidelines.'}"
          </p>
        )}
      </div>

      {/* WHAT TO DO & WHAT NOT TO DO Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WHAT TO DO */}
        <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💡</span>
              <h4 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wider">
                WHAT TO DO
              </h4>
            </div>
            <ul className="space-y-2.5">
              {(advisory?.what_to_do || [
                '💧 Stay hydrated to assist respiratory mucus clearance',
                '😷 Wear certified respiratory protection if pollution increases',
                '🏠 Keep indoor air clean and well-filtered',
                '🌬️ Check AQI before going outside',
                '🏃 Reduce strenuous outdoor activity when pollution is high'
              ]).map((item, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-emerald-700 shrink-0">✔</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* WHAT NOT TO DO */}
        <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🚫</span>
              <h4 className="font-extrabold text-sm text-rose-950 uppercase tracking-wider">
                WHAT NOT TO DO
              </h4>
            </div>
            <ul className="space-y-2.5">
              {(advisory?.what_not_to_do || [
                'Avoid unnecessary prolonged outdoor exposure during high pollution.',
                'Avoid strenuous outdoor exercise when AQI is high.',
                'Avoid spending unnecessary time near heavy traffic.',
                'Do not ignore severe pollution alerts.'
              ]).map((item, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-rose-600 shrink-0">✖</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Medically Conservative Disclaimer */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-700">Important Medical Notice:</strong> The AIRWISE system provides general environmental health guidance based on CPCB and WHO guidelines and is <em>not a substitute for professional medical advice, clinical diagnosis, or emergency healthcare</em>. Patients experiencing chest constriction or acute shortness of breath should seek immediate medical attention.
        </p>
      </div>
    </div>
  );
};
