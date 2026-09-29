import React, { useState } from 'react';
import { Wind, Bell, User as UserIcon, LogOut, Settings, MapPin, ChevronDown, Check, ShieldAlert, Sparkles, Map, BarChart3, HeartPulse } from 'lucide-react';
import { User, NotificationAlert } from '../types';

interface HeaderProps {
  user: User;
  activeTab: 'dashboard' | 'map' | 'advisory' | 'history' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'map' | 'advisory' | 'history' | 'settings') => void;
  onLogout: () => void;
  alerts: NotificationAlert[];
  unreadCount: number;
  onMarkAlertsRead: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  alerts,
  unreadCount,
  onMarkAlertsRead,
  onOpenSettings
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const handleToggleAlerts = () => {
    setShowAlertsDropdown(!showAlertsDropdown);
    if (!showAlertsDropdown && unreadCount > 0) {
      onMarkAlertsRead();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Wind className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                AIRWISE
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-medium text-slate-500">
                AI Advisory
              </span>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Station Map</span>
            </button>

            <button
              onClick={() => setActiveTab('advisory')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'advisory'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Advisory</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </nav>
        </div>

        {/* Right Actions: Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={handleToggleAlerts}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Pollution Alerts"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl py-3 z-50 animate-fadeIn">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-900">Pollution Alerts</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowAlertsDropdown(false);
                      onOpenSettings();
                    }}
                    className="text-xs text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {alerts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No alerts triggered yet. All saved locations are within safe limits.
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3.5 transition-colors ${
                          !alert.read ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {alert.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          AQI: <strong className="text-slate-800">{alert.aqi}</strong> · {alert.category}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {alert.precautions.slice(0, 3).map((p, i) => (
                            <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold shrink-0">›</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowAlertsDropdown(false);
                      onOpenSettings();
                    }}
                    className="text-xs font-medium text-slate-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Configure alert thresholds & sensitivity group
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="font-bold text-slate-900 truncate max-w-[120px]">{user.name}</div>
                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{user.home_city}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-bold text-xs text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                    <MapPin className="w-3 h-3" />
                    <span>Home: {user.home_city}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Alert & Health Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveTab('advisory');
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Personalized Advisory</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden border-t border-slate-200/80 bg-white/95 px-2 py-1.5 flex justify-around items-center">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg ${
            activeTab === 'dashboard' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg ${
            activeTab === 'map' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setActiveTab('advisory')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg ${
            activeTab === 'advisory' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
          }`}
        >
          Advisory
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg ${
            activeTab === 'history' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'
          }`}
        >
          History
        </button>
      </div>
    </header>
  );
};
