import React from 'react';
import { useTimer } from '../context/TimerContext';
import { useAuth } from '../context/AuthContext';
import MindAnchorLogo from './MindAnchorLogo';
import { 
  Volume2, 
  Settings, 
  User, 
  LogOut, 
  Flame, 
  Sun, 
  Moon,
  RefreshCw
} from 'lucide-react';

export default function Header({ onOpenAmbient, onOpenSettings, onOpenAuth }) {
  const { theme, setTheme, syncStatus, isOnline } = useTimer();
  const { currentUser, logout } = useAuth();

  const isLight = theme === 'Dawn Glow';

  const themeOptions = [
    { id: 'Ember Live', icon: Flame, tooltip: 'Ember Live (Warm Drifting Orbs)' },
    { id: 'Dawn Glow', icon: Sun, tooltip: 'Dawn Glow (Cream & Warm Light)' },
    { id: 'Obsidian Static', icon: Moon, tooltip: 'Obsidian Static (Battery Saver Dark)' },
  ];

  // Dynamic status evaluation listening to browser online/offline and auth state
  const browserOnline = typeof navigator !== 'undefined' ? (isOnline && navigator.onLine) : isOnline;
  const effectiveStatus = !browserOnline
    ? 'offline'
    : !currentUser
    ? 'offline'
    : (syncStatus === 'saving' || syncStatus === 'Cloud Sync: Saving...')
    ? 'saving'
    : 'synced';

  const statusLabel = effectiveStatus === 'saving'
    ? 'Cloud Sync: Saving...'
    : effectiveStatus === 'synced'
    ? 'Cloud Sync: Synced'
    : 'Cloud Sync: Offline';

  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2">
      {/* Brand & Sync Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          {/* Custom Animated Focus Engine MindAnchor Logo */}
          <MindAnchorLogo />

          <div>
            <div className="flex items-center gap-2">
              {/* High-Contrast MindAnchor Brand Name */}
              <h1 className={`text-xl font-extrabold tracking-tight transition-colors ${
                isLight 
                  ? 'text-stone-900 drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)]' 
                  : 'text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]'
              }`}>
                Mind<span className="text-[#FF6B00] drop-shadow-[0_0_12px_rgba(255,107,0,0.6)]">Anchor</span>
              </h1>

              {/* Subtle Pill Badge Matching Orange Theme */}
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#FF6B00]/30 bg-[#FF6B00]/10 text-[#FF6B00] shadow-[0_0_12px_rgba(255,107,0,0.15)] tracking-wider uppercase select-none transition-all">
                FlowState
              </span>
            </div>

            <p className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${
              isLight 
                ? 'text-stone-700 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]' 
                : 'text-stone-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]'
            }`}>
              Deep Work Focus Engine
            </p>
          </div>
        </div>

        {/* Curved Parallelogram Cloud Sync Indicator with Counter-Skewed Text & Refresh Icon */}
        <div 
          style={{ transform: 'skewX(-10deg)' }}
          className={`hidden sm:flex items-center px-3.5 py-1.5 rounded-xl border transition-all shadow-sm ${
            effectiveStatus === 'saving'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : effectiveStatus === 'synced'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'bg-stone-500/15 border-stone-500/40 text-stone-400'
          }`}
        >
          {/* Counter-skew internal content by 10deg to keep text & icon strictly upright and legible */}
          <div 
            style={{ transform: 'skewX(10deg)' }}
            className="flex items-center gap-2"
          >
            <RefreshCw 
              className={`w-3.5 h-3.5 shrink-0 ${
                effectiveStatus === 'saving'
                  ? 'animate-spin text-amber-400'
                  : effectiveStatus === 'synced'
                  ? 'text-emerald-400'
                  : 'text-stone-400'
              }`} 
            />
            <span className="whitespace-nowrap font-mono tracking-tight text-[11px] font-bold">
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Header Actions: Theme Switcher, Ambient Audio, Settings, Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dynamic Theme Switcher (Purely Icon-Based) */}
        <div 
          aria-label="Theme Switcher"
          className={`flex items-center p-1 rounded-2xl border transition-all ${
            isLight
              ? 'bg-white/80 border-stone-300 shadow-sm'
              : 'bg-black/50 border-stone-800'
          }`}
        >
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                title={opt.tooltip}
                aria-label={opt.tooltip}
                className={`relative p-2 rounded-xl transition-all flex items-center justify-center ${
                  isActive
                    ? 'bg-[#FF6B00]/20 text-[#FF6B00] ring-1.5 ring-[#FF6B00] shadow-[0_0_14px_rgba(255,107,0,0.5)]'
                    : isLight
                    ? 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B00] scale-110' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Ambient Sound Mixer Toggle */}
        <button
          onClick={onOpenAmbient}
          title="Ambient Sound Mixer"
          aria-label="Ambient Sound Mixer"
          className={`p-2.5 rounded-xl border transition-all ${
            isLight
              ? 'bg-white/80 border-stone-300 text-stone-800 hover:bg-white shadow-sm'
              : 'bg-stone-900/80 border-stone-800 text-stone-200 hover:text-white hover:border-[#FF6B00]/40'
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Timer Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Timer Preferences"
          aria-label="Timer Preferences"
          className={`p-2.5 rounded-xl border transition-all ${
            isLight
              ? 'bg-white/80 border-stone-300 text-stone-800 hover:bg-white shadow-sm'
              : 'bg-stone-900/80 border-stone-800 text-stone-200 hover:text-white hover:border-[#FF6B00]/40'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Auth Profile Button */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              title={`${currentUser?.user_metadata?.display_name || currentUser?.email} (Click to edit profile)`}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isLight
                  ? 'bg-white/80 border-stone-300 text-stone-800 hover:bg-white shadow-sm'
                  : 'bg-stone-900/80 border-stone-800 text-stone-200 hover:border-stone-700'
              }`}
            >
              <User className="w-4 h-4 text-[#FF6B00]" />
              <span className="max-w-[130px] truncate font-bold">
                {currentUser?.user_metadata?.display_name || currentUser?.displayName || currentUser?.email?.split('@')[0]}
              </span>
            </button>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold btn-primary-orange"
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
