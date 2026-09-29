import React from 'react';
import { Wind, Shield, Activity, Radio, Sparkles, HeartPulse, BarChart3, Bell } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Hackathon Innovation Grid */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              AIRWISE System Architecture
            </span>
            <h4 className="text-xl font-extrabold text-white mt-1">
              Engineered for Public Environmental Health
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-xl mb-1">🌫️</div>
              <h5 className="font-extrabold text-sm text-white">Real-Time AQI</h5>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Live PM2.5, PM10, CO, NO₂, SO₂, O₃ from CPCB continuous sensor networks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-xl mb-1">📍</div>
              <h5 className="font-extrabold text-sm text-white">Local Grid Monitoring</h5>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Hyper-local urban station detection and OpenStreetMap leaf marker navigation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-xl mb-1">🫁</div>
              <h5 className="font-extrabold text-sm text-white">AI Health Advisory</h5>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Medically conservative guidance tailored to 6 distinct sensitivity profiles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-xl mb-1">📊</div>
              <h5 className="font-extrabold text-sm text-white">Pollution History</h5>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Weekly and monthly data trend curves with verified comparative metrics.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-xl mb-1">🔔</div>
              <h5 className="font-extrabold text-sm text-white">Smart Threshold Alerts</h5>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Precaution triggers, cooldown deduplication, and browser push dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* System Disclaimer & Accreditation */}
        <div className="pt-8 border-t border-slate-800 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-white font-extrabold text-base">
            <Wind className="w-5 h-5 text-emerald-400" />
            <span>AIRWISE — AI Air Pollution & Health Advisory</span>
          </div>

          <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Data sourced from official Central Pollution Control Board (CPCB) continuous monitoring stations, state pollution control boards, and meteorological services. This software is designed for informational and public awareness purposes only and is not a substitute for clinical medical diagnosis.
          </p>

          <div className="text-[11px] text-slate-500 font-mono">
            Powered by Python Flask Microservices & TypeScript Engine · 2026
          </div>
        </div>
      </div>
    </footer>
  );
};
