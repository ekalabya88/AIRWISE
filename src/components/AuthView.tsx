import React, { useState } from 'react';
import { Eye, EyeOff, Wind, ShieldCheck, MapPin, Bell, Activity, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [homeCity, setHomeCity] = useState('Bhubaneswar');
  const [showPassword, setShowPassword] = useState(false);
  
  // Status states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setRecoveryCode(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          confirm_password: confirmPassword,
          home_city: homeCity
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setSuccessMsg(data.message);
      if (data.recovery_code) {
        setRecoveryCode(data.recovery_code);
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Subtle organic air stream background decorations */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-teal-50/20 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-sky-200/20 blur-3xl pointer-events-none" />

      {/* Top Simple Brand Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/10">
            <Wind className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">AIRWISE</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Environmental Health
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden md:flex items-center gap-4">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> CPCB & WHO Standards</span>
          <span>·</span>
          <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-teal-600" /> Real-time Sensor Grid</span>
        </div>
      </header>

      {/* Main Form Centerpiece */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Hero Tagline */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Breathe smarter.<br />
              <span className="text-emerald-700">Understand your air.</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
              Real-time atmospheric intelligence, sensor monitoring, and personalized AI health advisories.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            {/* Mode Tabs */}
            {mode !== 'forgot' && (
              <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('login'); resetForm(); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); resetForm(); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <p>{successMsg}</p>
                  {recoveryCode && (
                    <div className="mt-2 font-mono font-bold text-sm bg-white p-2 rounded border border-emerald-300 text-emerald-900 tracking-wider">
                      Recovery Code: {recoveryCode}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="login-email">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700" htmlFor="login-password">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); resetForm(); }}
                      className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Sign In to AirWise</span>
                  )}
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="signup-name">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Priya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="signup-email">
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="signup-city">
                    Home City <span className="text-slate-400 font-normal">(Used for alerts & map default)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-city"
                      type="text"
                      value={homeCity}
                      onChange={(e) => setHomeCity(e.target.value)}
                      placeholder="e.g. Bhubaneswar, Delhi, Mumbai"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="signup-password">
                    Password <span className="text-slate-400 font-normal">(Minimum 6 characters)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="signup-confirm-password">
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Create Free Account</span>
                  )}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-base font-bold text-slate-900">Reset Your Password</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Enter your account email to receive emergency password reset credentials.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="forgot-email">
                    Account Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); resetForm(); }}
                    className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1"
                  >
                    {loading ? 'Sending...' : 'Send Recovery'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Demo Credentials helper */}
          <div className="mt-4 p-3 bg-slate-100/80 rounded-xl border border-slate-200/60 text-center text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Quick Test:</span> You can sign up with any email or use{' '}
            <button
              onClick={() => {
                setName('Demo User');
                setEmail('demo@airwise.org');
                setPassword('airwise123');
                setConfirmPassword('airwise123');
                setHomeCity('Bhubaneswar');
                setMode('signup');
              }}
              className="text-emerald-700 underline font-medium hover:text-emerald-800"
            >
              Fill Demo Info
            </button>
          </div>
        </div>
      </main>

      {/* Footer Credentials & Accreditation */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-200/60">
        <p>
          AIRWISE System · Certified CPCB & WHO Ambient Air Quality Standard Metrics · Not a substitute for clinical diagnosis
        </p>
      </footer>
    </div>
  );
};
