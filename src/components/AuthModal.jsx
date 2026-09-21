import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import { X, User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup, resetPassword, authError, setAuthError } = useAuth();
  const { theme } = useTimer();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === 'Dawn Glow';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    setResetSent(false);

    try {
      if (isSignUp) {
        await signup(email, password, displayName);
      } else {
        await login(email, password);
      }
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setAuthError('Please enter your valid email address above first.');
      return;
    }
    setResetLoading(true);
    setAuthError('');
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      // error is set by auth context
    } finally {
      setResetLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setAuthError('');
    setResetSent(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border transition-all ${
        isLight
          ? 'bg-white border-stone-200 text-stone-900'
          : 'bg-[#0F0F14] border-stone-800 text-white'
      }`}>
        {/* 1. Clean Header & Copywriting: NO ICONS / NO EMOJIS */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-stone-800/40">
          <div>
            <h2 className={`text-2xl font-extrabold tracking-tight ${
              isLight ? 'text-stone-900' : 'text-white'
            }`}>
              {isSignUp ? 'Enter The FlowState' : 'Back to the Grind'}
            </h2>
            <p className={`text-xs mt-1 font-medium leading-relaxed ${
              isLight ? 'text-stone-500' : 'text-stone-400'
            }`}>
              {isSignUp
                ? 'Sync your deep work, analytics & daily streaks across devices.'
                : 'Pick up right where you left off and keep the streak alive.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Auth Modal"
            className="p-1.5 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-white transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold leading-snug">
            {authError}
          </div>
        )}

        {/* Password Reset Confirmation Alert */}
        {resetSent && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold leading-snug">
            Password reset link dispatched to <span className="underline">{email}</span>. Check your inbox!
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Display Name (Only during Sign Up) */}
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Display Name
              </label>
              <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all ${
                isLight ? 'bg-stone-100 border-stone-300 focus-within:border-[#FF6B00]' : 'bg-black/40 border-stone-800 focus-within:border-[#FF6B00]'
              }`}>
                <User className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full text-xs bg-transparent outline-none font-medium placeholder:text-stone-500"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Email Address
            </label>
            <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all ${
              isLight ? 'bg-stone-100 border-stone-300 focus-within:border-[#FF6B00]' : 'bg-black/40 border-stone-800 focus-within:border-[#FF6B00]'
            }`}>
              <Mail className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@flowstate.com"
                className="w-full text-xs bg-transparent outline-none font-medium placeholder:text-stone-500"
              />
            </div>
          </div>

          {/* Password with Eye/Eye-Off Visibility Toggle */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Password
              </label>
            </div>
            <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all ${
              isLight ? 'bg-stone-100 border-stone-300 focus-within:border-[#FF6B00]' : 'bg-black/40 border-stone-800 focus-within:border-[#FF6B00]'
            }`}>
              <Lock className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-transparent outline-none font-medium placeholder:text-stone-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-stone-400 hover:text-stone-200 transition-colors shrink-0 p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Forgot Password Link (Only in Sign In view) */}
            {!isSignUp && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8800] hover:underline transition-colors"
                >
                  {resetLoading ? 'Sending Recovery Link...' : 'Forgot Password?'}
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-orange w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-500/20 active:scale-[0.99] transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {loading
                ? 'Authenticating...'
                : isSignUp
                ? 'Create Cloud Account'
                : 'Sign In to FlowState'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="mt-6 pt-4 border-t border-stone-800/60 text-center">
          <button
            onClick={handleToggleMode}
            className="text-xs font-semibold text-stone-400 hover:text-[#FF6B00] transition-colors"
          >
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <span className="text-[#FF6B00] font-bold hover:underline">Sign In</span>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <span className="text-[#FF6B00] font-bold hover:underline">
                  Sign Up for Cloud Sync
                </span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
