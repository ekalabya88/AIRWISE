import React, { useState } from 'react';
import { X, Bell, Shield, Save, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { User } from '../types';

interface NotificationSettingsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updated: User) => void;
  onTriggerTestAlert: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onTriggerTestAlert
}) => {
  const [notifyEnabled, setNotifyEnabled] = useState(user.notify_enabled ?? true);
  const [threshold, setThreshold] = useState(user.alert_threshold || 'moderate');
  const [sensitivity, setSensitivity] = useState(user.sensitivity_group || 'general');
  const [homeCity, setHomeCity] = useState(user.home_city || 'Bhubaneswar');
  const [savedLocs, setSavedLocs] = useState<string[]>(
    user.saved_locations || [user.home_city, 'Delhi', 'Mumbai']
  );
  const [newLocInput, setNewLocInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notify_enabled: notifyEnabled,
          alert_threshold: threshold,
          sensitivity_group: sensitivity,
          home_city: homeCity,
          saved_locations: savedLocs
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update preferences');
      onUpdateUser(data.user);
      setStatusMsg('Preferences saved successfully!');
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err: any) {
      alert(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLocation = () => {
    if (newLocInput.trim() && !savedLocs.includes(newLocInput.trim())) {
      setSavedLocs([...savedLocs, newLocInput.trim()]);
      setNewLocInput('');
    }
  };

  const handleRemoveLocation = (loc: string) => {
    setSavedLocs(savedLocs.filter((l) => l !== loc));
  };

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setStatusMsg('Browser push notifications enabled!');
      } else {
        setStatusMsg('Browser notifications permission denied.');
      }
    } else {
      setStatusMsg('Notifications are not supported in this browser environment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Pollution Alert Settings
              </h3>
              <p className="text-xs text-slate-500">
                Threshold triggers & sensitivity precautions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {statusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Toggle Alert Notification Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Air Quality Alerts Active
              </span>
              <span className="text-[11px] text-slate-500 block">
                Receive warnings when AQI crosses safety threshold
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNotifyEnabled(!notifyEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                notifyEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifyEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Alert Threshold Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Alert Trigger Threshold (CPCB Scale)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'satisfactory', label: 'Satisfactory (> 50 AQI)', color: 'text-lime-700' },
                { id: 'moderate', label: 'Moderate (> 100 AQI)', color: 'text-amber-700' },
                { id: 'poor', label: 'Poor (> 200 AQI)', color: 'text-orange-700' },
                { id: 'severe', label: 'Severe (> 300 AQI)', color: 'text-rose-700' }
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setThreshold(t.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    threshold === t.id
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={t.color}>●</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sensitivity Group */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Personal Sensitivity Group
            </label>
            <select
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
            >
              <option value="general">👤 General Public (Normal baseline)</option>
              <option value="children">👶 Children (High ventilation volume)</option>
              <option value="elderly">👵 Elderly (Cardiac & pulmonary care)</option>
              <option value="respiratory">🫁 Respiratory-sensitive (Asthma, COPD)</option>
              <option value="outdoor_sports">🏃 Outdoor / Sports (Aerobic athletes)</option>
              <option value="outdoor_worker">👷 Outdoor Worker (Long shift exposure)</option>
            </select>
          </div>

          {/* Saved Locations */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Saved Locations for Continuous Monitoring
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {savedLocs.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                >
                  <span>{loc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="text-slate-400 hover:text-slate-700 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newLocInput}
                onChange={(e) => setNewLocInput(e.target.value)}
                placeholder="Add city (e.g. Cuttack, Puri)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
              <button
                type="button"
                onClick={handleAddLocation}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Add
              </button>
            </div>
          </div>

          {/* Test Alert Button & Browser Notification Perms */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">
                Trigger Test Precaution Alert
              </span>
              <button
                type="button"
                onClick={onTriggerTestAlert}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Fire Test Alert</span>
              </button>
            </div>
            <p className="text-[11px] text-amber-800">
              Generates an instant threshold alert with conservative medical precautions. One alert per threshold change with deduplication.
            </p>
            <button
              type="button"
              onClick={requestBrowserPermission}
              className="text-[11px] text-emerald-800 underline font-semibold hover:text-emerald-900 block"
            >
              Request Browser Push Notification Permission
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
