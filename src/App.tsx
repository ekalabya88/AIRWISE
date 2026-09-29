import React, { useState, useEffect } from 'react';
import { AuthView } from './components/AuthView';
import { Header } from './components/Header';
import { LiveAqiWeatherCard } from './components/LiveAqiWeatherCard';
import { AqiGauge } from './components/AqiGauge';
import { NearbyAqiSection } from './components/NearbyAqiSection';
import { InteractiveMap } from './components/InteractiveMap';
import { HealthAdvisorySection } from './components/HealthAdvisorySection';
import { HistorySection } from './components/HistorySection';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { Footer } from './components/Footer';
import { User, CurrentAQIResponse, NearbyLocationItem, NotificationAlert, StationData } from './types';
import { Wind, MapPin, Navigation, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // App navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'advisory' | 'history' | 'settings'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Air Quality state
  const [currentCity, setCurrentCity] = useState('Bhubaneswar');
  const [currentAqiData, setCurrentAqiData] = useState<CurrentAQIResponse | null>(null);
  const [nearbyList, setNearbyList] = useState<NearbyLocationItem[]>([]);
  const [loadingAqi, setLoadingAqi] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Notifications
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check initial session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.user.home_city) {
            setCurrentCity(data.user.home_city);
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setAuthChecking(false);
      }
    };
    checkSession();
  }, []);

  // Fetch AQI Data for currently selected city/station
  const loadAQIData = async (city: string, lat?: number, lon?: number) => {
    try {
      setLoadingAqi(true);
      let aqiUrl = `/api/aqi/current?city=${encodeURIComponent(city)}`;
      if (lat !== undefined && lon !== undefined) {
        aqiUrl += `&lat=${lat}&lon=${lon}`;
      }

      const [aqiRes, nearbyRes] = await Promise.all([
        fetch(aqiUrl),
        fetch(`/api/aqi/nearby?city=${encodeURIComponent(city)}`)
      ]);

      const aqiJson = await aqiRes.json();
      const nearbyJson = await nearbyRes.json();

      setCurrentAqiData(aqiJson);
      setNearbyList(nearbyJson.nearby || []);
    } catch (err) {
      console.error('Failed to load AQI telemetry:', err);
    } finally {
      setLoadingAqi(false);
    }
  };

  // Fetch Notifications for logged-in user
  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setAlerts(data.alerts || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAQIData(currentCity);
      loadNotifications();
    }
  }, [currentUser, currentCity]);

  // Handle Station selection from Nearby list or Map
  const handleSelectStation = (stationId: string, locationName: string) => {
    setCurrentCity(locationName);
    loadAQIData(locationName);
  };

  const handleSelectStationFromMap = (station: StationData) => {
    setCurrentCity(station.city);
    loadAQIData(station.city, station.lat, station.lon);
  };

  // Use my location geolocation trigger
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await loadAQIData('My Location', latitude, longitude);
          setCurrentCity('My Location');
        } catch {
          // fallback
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Mark all notifications read
  const handleMarkAlertsRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all' })
      });
      setUnreadCount(0);
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Trigger Test Alert
  const handleTriggerTestAlert = async () => {
    try {
      const res = await fetch('/api/notifications/test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: currentCity,
          aqi: currentAqiData ? Math.max(currentAqiData.aqi, 160) : 165
        })
      });
      const data = await res.json();
      if (data.alert) {
        setAlerts((prev) => [data.alert, ...prev]);
        setUnreadCount((c) => c + 1);

        // Also trigger browser Notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(data.alert.title, {
            body: data.alert.precautions.join(' '),
            icon: '/favicon.ico'
          });
        }
      }
    } catch (err) {
      console.error('Failed to trigger test alert:', err);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  // Loading screen while verifying auth session
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 animate-pulse">
            <Wind className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Initializing AIRWISE Telemetry...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated user -> Landing page is Sign In / Sign Up
  if (!currentUser) {
    return <AuthView onLoginSuccess={(u) => { setCurrentUser(u); setCurrentCity(u.home_city || 'Bhubaneswar'); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <Header
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        alerts={alerts}
        unreadCount={unreadCount}
        onMarkAlertsRead={handleMarkAlertsRead}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-lg">
              {/* Subtle background wind streams */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">
                    🌿 AIRWISE
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs text-slate-300 font-medium">Continuous Ambient Air Quality</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Breathe smarter.<br />
                  <span className="text-emerald-400">Understand your air.</span>
                </h1>

                <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                  Real-time atmospheric particulate monitoring, CPCB-calibrated risk detection, and clinical-grade preventive health advisories.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById('live-aqi-card');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Check My Air Quality</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Navigation className={`w-4 h-4 text-emerald-300 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detecting...' : 'Near My Location'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Location Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Monitoring Location
                  </span>
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{currentCity}</span>
                    <span className="text-slate-300 font-normal">|</span>
                    <span className="text-xs text-slate-500 font-normal">
                      {currentAqiData?.station?.name || 'CPCB Continuous Station'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saved Locations Quick Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">
                  Quick Switch:
                </span>
                {['Bhubaneswar', 'Delhi', 'Mumbai', 'Bengaluru', 'Kolkata'].map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setCurrentCity(city);
                      loadAQIData(city);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentCity === city
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. AQI & WEATHER (Sensor & Detector) + 2. AQI Gauge Meter */}
            <div id="live-aqi-card" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveAqiWeatherCard
                  data={currentAqiData}
                  loading={loadingAqi}
                  onRefresh={() => loadAQIData(currentCity)}
                />
              </div>

              <div className="lg:col-span-1">
                <AqiGauge
                  aqi={currentAqiData?.aqi || 85}
                  category={currentAqiData?.category || 'Moderate'}
                  tier={currentAqiData?.tier || 'MEDIUM'}
                  color={currentAqiData?.color || '#eab308'}
                  meaning={currentAqiData?.meaning || 'Air quality is moderate today.'}
                />
              </div>
            </div>

            {/* 3. NEAR LOCATION AQI */}
            <NearbyAqiSection
              currentCity={currentCity}
              nearbyList={nearbyList}
              onSelectStation={handleSelectStation}
              onUseMyLocation={handleUseMyLocation}
              onSearchCity={(q) => {
                setCurrentCity(q);
                loadAQIData(q);
              }}
              onOpenMap={() => setActiveTab('map')}
              isLocating={isLocating}
            />

            {/* 4. AI HEALTH ADVISORY */}
            <HealthAdvisorySection
              currentAqi={currentAqiData?.aqi || 85}
              currentLocation={currentCity}
              pm25={currentAqiData?.pollutants?.pm25?.value || 36.4}
              userSensitivity={currentUser.sensitivity_group || 'general'}
              onUpdateSensitivity={(group) => {
                setCurrentUser({ ...currentUser, sensitivity_group: group });
              }}
            />

            {/* 5. YOUR AIR QUALITY HISTORY (Weekly / Monthly Recap) */}
            <HistorySection city={currentCity} />
          </div>
        )}

        {/* INTERACTIVE MAP TAB */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Interactive Air Quality Monitoring Map
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time CPCB scale observation points with strict alphabetical search and popup telemetries.
              </p>
            </div>

            <InteractiveMap
              onSelectStation={handleSelectStationFromMap}
              userHomeCity={currentUser.home_city}
            />
          </div>
        )}

        {/* AI ADVISORY DEEP DIVE TAB */}
        {activeTab === 'advisory' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                AI Health Advisory Deep Dive
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Personalized pulmonary and cardiovascular guidance based on ambient particulate exposure.
              </p>
            </div>

            <HealthAdvisorySection
              currentAqi={currentAqiData?.aqi || 85}
              currentLocation={currentCity}
              pm25={currentAqiData?.pollutants?.pm25?.value || 36.4}
              userSensitivity={currentUser.sensitivity_group || 'general'}
              onUpdateSensitivity={(group) => {
                setCurrentUser({ ...currentUser, sensitivity_group: group });
              }}
            />
          </div>
        )}

        {/* HISTORY ANALYTICS TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Historical Atmospheric Trends
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Weekly and monthly comparative data charts with data-backed progress verification.
              </p>
            </div>

            <HistorySection city={currentCity} />
          </div>
        )}
      </main>

      {/* Notification Preferences Modal */}
      <NotificationSettingsModal
        user={currentUser}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
