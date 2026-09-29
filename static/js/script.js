/**
 * AIRWISE Vanilla JavaScript Client
 * Communicates with Python Flask Backend via Fetch API
 */

let currentUser = null;
let currentCity = 'Bhubaneswar';
let currentAqi = 85;
let currentSensitivity = 'general';
let mapInstance = null;
let mapMarkers = {};
let allStations = [];
let alerts = [];

document.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
});

// -------------------------------------------------------------
// Authentication & Session Management
// -------------------------------------------------------------
async function checkAuthSession() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.authenticated && data.user) {
      currentUser = data.user;
      currentCity = currentUser.home_city || 'Bhubaneswar';
      currentSensitivity = currentUser.sensitivity_group || 'general';
      showAppView();
    } else {
      showAuthView();
    }
  } catch (err) {
    showAuthView();
  }
}

function showAuthView() {
  document.getElementById('auth-view').classList.remove('hidden');
  document.getElementById('app-view').classList.add('hidden');
}

function showAppView() {
  document.getElementById('auth-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');

  document.getElementById('user-name-display').textContent = currentUser.name;
  document.getElementById('user-city-display').textContent = currentCity;
  document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

  loadDashboardData(currentCity);
  loadNotifications();
}

function setAuthTab(mode) {
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const formForgot = document.getElementById('form-forgot');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabSignupBtn = document.getElementById('tab-signup-btn');
  const errBox = document.getElementById('auth-error');
  const succBox = document.getElementById('auth-success');
  errBox.classList.add('hidden');
  succBox.classList.add('hidden');

  if (mode === 'login') {
    formLogin.classList.remove('hidden');
    formSignup.classList.add('hidden');
    formForgot.classList.add('hidden');
    tabLoginBtn.className = 'flex-1 py-2 text-sm font-semibold rounded-lg bg-white text-slate-900 shadow-sm transition-all';
    tabSignupBtn.className = 'flex-1 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:text-slate-900 transition-all';
  } else if (mode === 'signup') {
    formLogin.classList.add('hidden');
    formSignup.classList.remove('hidden');
    formForgot.classList.add('hidden');
    tabLoginBtn.className = 'flex-1 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:text-slate-900 transition-all';
    tabSignupBtn.className = 'flex-1 py-2 text-sm font-semibold rounded-lg bg-white text-slate-900 shadow-sm transition-all';
  } else if (mode === 'forgot') {
    formLogin.classList.add('hidden');
    formSignup.classList.add('hidden');
    formForgot.classList.remove('hidden');
  }
}

function togglePasswordVisibility(id) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
}

function fillDemoCredentials() {
  setAuthTab('signup');
  document.getElementById('signup-name').value = 'Demo Student';
  document.getElementById('signup-email').value = 'student@example.edu';
  document.getElementById('signup-city').value = 'Bhubaneswar';
  document.getElementById('signup-password').value = 'airwise123';
  document.getElementById('signup-confirm').value = 'airwise123';
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errBox = document.getElementById('auth-error');
  errBox.classList.add('hidden');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid credentials');
    currentUser = data.user;
    currentCity = currentUser.home_city || 'Bhubaneswar';
    showAppView();
  } catch (err) {
    errBox.textContent = err.message;
    errBox.classList.remove('hidden');
  }
}

async function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const home_city = document.getElementById('signup-city').value;
  const password = document.getElementById('signup-password').value;
  const confirm_password = document.getElementById('signup-confirm').value;
  const errBox = document.getElementById('auth-error');
  errBox.classList.add('hidden');

  if (password !== confirm_password) {
    errBox.textContent = 'Passwords do not match';
    errBox.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirm_password, home_city })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    currentUser = data.user;
    currentCity = currentUser.home_city || 'Bhubaneswar';
    showAppView();
  } catch (err) {
    errBox.textContent = err.message;
    errBox.classList.remove('hidden');
  }
}

async function handleForgotSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value;
  const succBox = document.getElementById('auth-success');
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  succBox.innerHTML = `<strong>Recovery Dispatched:</strong> ${data.message} ${data.recovery_code ? '<br><code class="font-mono mt-1 block">Code: ' + data.recovery_code + '</code>' : ''}`;
  succBox.classList.remove('hidden');
}

async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  currentUser = null;
  showAuthView();
}

// -------------------------------------------------------------
// Live AQI, Weather & Dashboard Data
// -------------------------------------------------------------
async function loadDashboardData(city) {
  document.getElementById('active-location-name').textContent = city;

  try {
    const [aqiRes, nearbyRes] = await Promise.all([
      fetch(`/api/aqi/current?city=${encodeURIComponent(city)}`),
      fetch(`/api/aqi/nearby?city=${encodeURIComponent(city)}`)
    ]);
    const aqiData = await aqiRes.json();
    const nearbyData = await nearbyRes.json();

    currentAqi = aqiData.aqi;
    renderAqiCard(aqiData);
    renderGauge(aqiData);
    renderNearby(nearbyData.nearby || []);
    loadHealthAdvisory(currentAqi, currentSensitivity, city);
    loadHistoryData(city);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  }
}

function renderAqiCard(data) {
  document.getElementById('active-station-name').textContent = data.station ? data.station.name : 'CAAQMS';
  document.getElementById('sensor-source-label').textContent = data.source || 'Continuous Station';
  document.getElementById('val-aqi-num').textContent = data.aqi;
  document.getElementById('val-aqi-tier').textContent = `${data.tier === 'LOW' ? '🟢' : data.tier === 'MEDIUM' ? '🟡' : '🔴'} ${data.tier} LEVEL`;
  document.getElementById('val-aqi-cat').textContent = data.category;

  document.getElementById('val-weather-cond').textContent = data.weather.summary;
  document.getElementById('val-weather-hum').textContent = data.weather.humidity_formatted;
  document.getElementById('val-weather-wind').textContent = data.weather.wind_formatted;

  document.getElementById('val-pm25').textContent = data.pollutants.pm25.value;
  document.getElementById('val-pm10').textContent = data.pollutants.pm10.value;
  document.getElementById('val-no2').textContent = data.pollutants.no2.value;
  document.getElementById('val-so2').textContent = data.pollutants.so2.value;
  document.getElementById('val-co').textContent = data.pollutants.co.value;
  document.getElementById('val-o3').textContent = data.pollutants.o3.value;
}

function renderGauge(data) {
  const arc = document.getElementById('gauge-arc');
  const aqiVal = data.aqi;
  const clamped = Math.min(Math.max(aqiVal, 0), 400);
  const percentage = clamped / 400;
  const circumference = 282.7;
  const offset = circumference - percentage * circumference;

  arc.style.strokeDashoffset = offset;
  arc.style.stroke = data.color || '#eab308';

  document.getElementById('gauge-aqi-val').textContent = aqiVal;
  document.getElementById('gauge-cat-val').textContent = `${data.category} ${data.tier === 'LOW' ? '🟢' : data.tier === 'MEDIUM' ? '🟡' : '🔴'}`;
  document.getElementById('gauge-meaning').textContent = data.meaning;

  const badge = document.getElementById('gauge-badge');
  badge.textContent = `${data.tier === 'LOW' ? '🟢' : data.tier === 'MEDIUM' ? '🟡' : '🔴'} ${data.tier}`;
}

function renderNearby(list) {
  const container = document.getElementById('nearby-grid');
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = '<div class="col-span-3 text-center py-6 text-xs text-slate-400">Data unavailable for this grid location.</div>';
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all cursor-pointer';
    card.onclick = () => changeLocation(item.city);
    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <div class="font-extrabold text-sm text-slate-900">${item.name}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">📍 ${item.city} · ${item.distance}</div>
        </div>
        <div class="text-right">
          <div class="text-lg font-black text-slate-900 leading-none">${item.aqi}</div>
          <span class="text-[10px] font-bold text-slate-600">${item.tier} ${item.tier === 'LOW' ? '🟢' : item.tier === 'MEDIUM' ? '🟡' : '🔴'}</span>
        </div>
      </div>
      <div class="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[10px] text-slate-400">
        <span>${item.sensor_type.split(' ')[0]} Sensor</span>
        <span class="text-emerald-700 font-semibold">Inspect ›</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function changeLocation(city) {
  currentCity = city;
  loadDashboardData(city);
}

// -------------------------------------------------------------
// AI Health Advisory
// -------------------------------------------------------------
async function loadHealthAdvisory(aqi, group, location) {
  try {
    const res = await fetch('/api/advisory/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aqi, sensitivity_group: group, location })
    });
    const data = await res.json();

    document.getElementById('advisory-pill').textContent = `${data.tier === 'LOW' ? '🟢' : data.tier === 'MEDIUM' ? '🟡' : '🔴'} ${data.tier} AQI: ${aqi}`;
    document.getElementById('advisory-text').textContent = `"${data.advisory || data.summary}"`;

    const whatToDo = document.getElementById('what-to-do-list');
    whatToDo.innerHTML = (data.what_to_do || []).map(item => `<li><span class="font-bold text-emerald-700 mr-1">✔</span>${item}</li>`).join('');

    const whatNotToDo = document.getElementById('what-not-to-do-list');
    whatNotToDo.innerHTML = (data.what_not_to_do || []).map(item => `<li><span class="font-bold text-rose-600 mr-1">✖</span>${item}</li>`).join('');
  } catch (err) {
    console.error('Error loading advisory:', err);
  }
}

function selectSensitivity(group) {
  currentSensitivity = group;
  document.querySelectorAll('#sensitivity-selector button').forEach(btn => {
    if (btn.getAttribute('data-id') === group) {
      btn.className = 'p-3 rounded-xl border border-emerald-600 bg-emerald-50 text-left cursor-pointer';
    } else {
      btn.className = 'p-3 rounded-xl border border-slate-200 bg-white text-left cursor-pointer';
    }
  });
  loadHealthAdvisory(currentAqi, currentSensitivity, currentCity);
}

// -------------------------------------------------------------
// History (Weekly / Monthly)
// -------------------------------------------------------------
let historyCache = null;
async function loadHistoryData(city) {
  try {
    const res = await fetch(`/api/aqi/history?city=${encodeURIComponent(city)}`);
    historyCache = await res.json();
    setHistoryTab('weekly');
  } catch (err) {
    console.error('Error fetching history:', err);
  }
}

function setHistoryTab(tab) {
  const container = document.getElementById('history-container');
  const tabW = document.getElementById('hist-tab-weekly');
  const tabM = document.getElementById('hist-tab-monthly');
  if (!historyCache) return;

  if (tab === 'weekly') {
    tabW.className = 'px-3 py-1.5 bg-white rounded-lg shadow-sm font-bold';
    tabM.className = 'px-3 py-1.5 text-slate-600 rounded-lg font-bold';
    const w = historyCache.weekly;
    container.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-xs text-slate-500 block">Average AQI</span>
          <span class="text-2xl font-black text-slate-900 mt-1 block">${w.average_aqi}</span>
        </div>
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-xs text-slate-500 block">Lowest AQI</span>
          <span class="text-2xl font-black text-emerald-600 mt-1 block">${w.lowest_aqi}</span>
        </div>
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-xs text-slate-500 block">Highest AQI</span>
          <span class="text-2xl font-black text-rose-600 mt-1 block">${w.highest_aqi}</span>
        </div>
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-xs text-slate-500 block">Average PM2.5</span>
          <span class="text-2xl font-black text-slate-900 mt-1 block">${w.average_pm25} µg/m³</span>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between"><span>🟢 Low</span><strong>${w.low_days} days</strong></div>
        <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between"><span>🟡 Medium</span><strong>${w.medium_days} days</strong></div>
        <div class="p-3 bg-rose-50 rounded-xl border border-rose-200 flex justify-between"><span>🔴 High</span><strong>${w.high_days} days</strong></div>
      </div>
    `;
  } else {
    tabW.className = 'px-3 py-1.5 text-slate-600 rounded-lg font-bold';
    tabM.className = 'px-3 py-1.5 bg-white rounded-lg shadow-sm font-bold';
    const m = historyCache.monthly;
    container.innerHTML = `
      <div class="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl mb-4 flex justify-between items-center">
        <div>
          <span class="text-xs uppercase text-emerald-100 font-bold">${m.month_name} Summary</span>
          <div class="text-2xl font-black">Average AQI: ${m.average_aqi}</div>
        </div>
        <div class="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">${m.trend_statement}</div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100"><span class="text-xs text-slate-500 block">Peak Pollution</span><strong>${m.highest_pollution_day}</strong></div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100"><span class="text-xs text-slate-500 block">Cleanest Day</span><strong>${m.lowest_pollution_day}</strong></div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100"><span class="text-xs text-slate-500 block">High AQI Days</span><strong>${m.high_aqi_days} Days</strong></div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100"><span class="text-xs text-slate-500 block">PM2.5 Trend</span><strong>${m.pm25_trend}</strong></div>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// Interactive Map (Leaflet) with A→Z Alphabetical Search
// -------------------------------------------------------------
async function initLeafletMap() {
  if (mapInstance) return;
  const container = document.getElementById('leaflet-map');
  if (!container) return;

  mapInstance = L.map('leaflet-map').setView([20.2961, 85.8245], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance);

  const res = await fetch('/api/aqi/stations');
  const data = await res.json();
  allStations = data.stations || [];

  allStations.forEach(s => {
    const color = s.color || '#10b981';
    const markerHtml = `
      <div style="background-color: ${color}; color: white; padding: 3px 6px; border-radius: 12px; font-weight: 800; font-size: 11px; display: flex; gap: 4px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <span>${s.aqi}</span>
        <span style="font-size: 9px; opacity: 0.9; text-transform: uppercase;">${s.category}</span>
      </div>
    `;
    const icon = L.divIcon({ html: markerHtml, className: 'cpcb-marker', iconSize: [75, 24], iconAnchor: [37, 12] });
    const marker = L.marker([s.lat, s.lon], { icon }).addTo(mapInstance);
    marker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px;">
        <strong>${s.name}</strong><br>
        <span style="color: ${color}; font-weight: bold; font-size: 14px;">${s.aqi} AQI (${s.category})</span><br>
        <span style="font-size: 10px; color: #64748b;">${s.sensor_type}</span>
      </div>
    `);
    mapMarkers[s.id] = marker;
  });
}

function handleMapSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const dropdown = document.getElementById('map-search-dropdown');
  if (!query) {
    dropdown.classList.add('hidden');
    return;
  }

  // Strict alphabetical filtering (A->Z)
  const matches = allStations
    .filter(s => s.name.toLowerCase().includes(query) || s.city.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!matches.length) {
    dropdown.innerHTML = '<div class="p-3 text-slate-400 text-center">No matching location found</div>';
  } else {
    dropdown.innerHTML = matches.map(s => `
      <div onclick="selectMapStation('${s.id}')" class="p-2.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-b border-slate-100">
        <div><strong>${s.name}</strong><br><span class="text-[10px] text-slate-500">${s.city}</span></div>
        <span class="px-2 py-0.5 rounded text-white font-bold text-[10px]" style="background: ${s.color}">${s.aqi} AQI</span>
      </div>
    `).join('');
  }
  dropdown.classList.remove('hidden');
}

function selectMapStation(id) {
  const s = allStations.find(x => x.id === id);
  if (!s || !mapInstance) return;
  document.getElementById('map-search-dropdown').classList.add('hidden');
  document.getElementById('map-search-input').value = s.name;
  mapInstance.setView([s.lat, s.lon], 13);
  if (mapMarkers[id]) mapMarkers[id].openPopup();
  changeLocation(s.city);
}

function detectUserLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    changeLocation('My Location');
    if (mapInstance) mapInstance.setView([latitude, longitude], 12);
  });
}

// -------------------------------------------------------------
// Navigation Tabs
// -------------------------------------------------------------
function setNavTab(tab) {
  ['dashboard', 'map', 'advisory', 'history'].forEach(t => {
    document.getElementById(`tab-${t}-view`).classList.add('hidden');
    const btn = document.getElementById(`nav-${t}-btn`);
    if (btn) btn.className = 'px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900';
  });

  document.getElementById(`tab-${tab}-view`).classList.remove('hidden');
  const activeBtn = document.getElementById(`nav-${tab}-btn`);
  if (activeBtn) activeBtn.className = 'px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-900 shadow-sm';

  if (tab === 'map') {
    setTimeout(() => {
      initLeafletMap();
      if (mapInstance) mapInstance.invalidateSize();
    }, 150);
  }
}

// -------------------------------------------------------------
// Notifications & Alerts
// -------------------------------------------------------------
async function loadNotifications() {
  const res = await fetch('/api/notifications');
  const data = await res.json();
  alerts = data.alerts || [];
  const badge = document.getElementById('unread-badge');
  if (data.unread_count > 0) {
    badge.textContent = data.unread_count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function toggleAlertsDropdown() {
  const el = document.getElementById('alerts-dropdown');
  el.classList.toggle('hidden');
  const list = document.getElementById('alerts-list');
  if (!alerts.length) {
    list.innerHTML = '<div class="p-4 text-center text-slate-400">No alerts triggered yet.</div>';
    return;
  }
  list.innerHTML = alerts.map(a => `
    <div class="p-2.5 ${!a.read ? 'bg-emerald-50/50' : ''}">
      <strong class="text-slate-900">${a.title}</strong>
      <div class="text-slate-500 mt-0.5">AQI: <strong>${a.aqi}</strong> (${a.category})</div>
      <ul class="mt-1 text-[11px] text-slate-600 list-disc list-inside">
        ${a.precautions.slice(0, 2).map(p => `<li>${p}</li>`).join('')}
      </ul>
    </div>
  `).join('');
  fetch('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'all' }) });
  document.getElementById('unread-badge').classList.add('hidden');
}

function openSettingsModal() {
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.add('hidden');
}

async function fireTestAlert() {
  const res = await fetch('/api/notifications/test-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: currentCity, aqi: 165 })
  });
  const data = await res.json();
  if (data.alert) {
    alerts.unshift(data.alert);
    loadNotifications();
    alert('Test Precaution Alert Dispatched!');
  }
}

async function saveModalSettings() {
  const threshold = document.getElementById('modal-threshold').value;
  await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert_threshold: threshold })
  });
  closeSettingsModal();
}
