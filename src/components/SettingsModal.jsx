import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { useAuth } from '../context/AuthContext';
import { X, Settings, Clock, Volume2, Save, Play, User, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { theme, settings, setSettings, playAlertChime, playTabWarningTone } = useTimer();
  const { currentUser, updateDisplayName } = useAuth();

  const [workDuration, setWorkDuration] = useState(settings.workDuration);
  const [breakDuration, setBreakDuration] = useState(settings.breakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartWork, setAutoStartWork] = useState(settings.autoStartWork);
  const [strictMode, setStrictMode] = useState(settings.strictMode !== false);
  const [tabSwitchAlert, setTabSwitchAlert] = useState(settings.tabSwitchAlert !== false);
  const [alarmVolume, setAlarmVolume] = useState(settings.alarmVolume !== undefined ? settings.alarmVolume : 0.8);

  // Profile Display Name state
  const [displayName, setDisplayName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);
  const [nameSavedNotice, setNameSavedNotice] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const currentName = currentUser.user_metadata?.display_name || currentUser.displayName || '';
      setDisplayName(currentName);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const isLight = theme === 'Dawn Glow';

  const handleSave = async (e) => {
    e.preventDefault();

    // 1. Update Timer Preferences
    setSettings(prev => ({
      ...prev,
      workDuration: parseInt(workDuration) || 25,
      breakDuration: parseInt(breakDuration) || 5,
      longBreakDuration: parseInt(longBreakDuration) || 15,
      autoStartBreaks,
      autoStartWork,
      strictMode,
      tabSwitchAlert,
      alarmVolume: parseFloat(alarmVolume),
    }));

    // 2. Persist Display Name to Supabase Auth metadata if changed
    if (currentUser && updateDisplayName) {
      const initialName = currentUser.user_metadata?.display_name || currentUser.displayName || '';
      if (displayName.trim() !== initialName.trim()) {
        try {
          setUpdatingName(true);
          await updateDisplayName(displayName.trim());
        } catch (err) {
          console.error("Error saving display name:", err);
        } finally {
          setUpdatingName(false);
        }
      }
    }

    onClose();
  };

  const handleQuickUpdateName = async () => {
    if (!currentUser || !updateDisplayName) return;
    try {
      setUpdatingName(true);
      await updateDisplayName(displayName.trim());
      setNameSavedNotice(true);
      setTimeout(() => setNameSavedNotice(false), 2500);
    } catch (err) {
      console.error("Error saving display name:", err);
    } finally {
      setUpdatingName(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border transition-all max-h-[90vh] overflow-y-auto ${
        isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-[#0F0F14] border-stone-800 text-white'
      }`}>
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Preferences & Profile</h2>
              <p className="text-[11px] text-stone-400 font-medium">Customize your focus rhythm & identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="p-1.5 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Profile Display Name Field (Supabase Auth Metadata) */}
          {currentUser && (
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl border border-[#FF6B00]/20 bg-[#FF6B00]/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                  <User className="w-3.5 h-3.5" />
                  <span>Profile Display Name</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono truncate max-w-[140px]" title={currentUser.email}>
                  {currentUser.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                    isLight ? 'bg-white border-stone-300 focus:border-[#FF6B00]' : 'bg-black/50 border-stone-800 focus:border-[#FF6B00]'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleQuickUpdateName}
                  disabled={updatingName}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#FF7A1A] transition-all shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Update Display Name in Supabase"
                >
                  {nameSavedNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : updatingName ? (
                    <span>Saving...</span>
                  ) : (
                    <span>Update</span>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-stone-400">
                Instantly updates your header and cloud profile badge across all synced sessions.
              </p>
            </div>
          )}

          {/* Time Durations */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Durations (Minutes)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-stone-400">Work</span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(e.target.value)}
                  className={`p-2.5 rounded-xl border text-center font-mono text-sm font-bold ${
                    isLight ? 'bg-stone-100 border-stone-300' : 'bg-black/40 border-stone-800'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-stone-400">Short Break</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(e.target.value)}
                  className={`p-2.5 rounded-xl border text-center font-mono text-sm font-bold ${
                    isLight ? 'bg-stone-100 border-stone-300' : 'bg-black/40 border-stone-800'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-stone-400">Long Break</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(e.target.value)}
                  className={`p-2.5 rounded-xl border text-center font-mono text-sm font-bold ${
                    isLight ? 'bg-stone-100 border-stone-300' : 'bg-black/40 border-stone-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Automation & Focus Lock Toggles */}
          <div className="flex flex-col gap-3 pt-2 border-t border-stone-800/40">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">Focus Lock (Strict Mode)</span>
                <span className="text-[10px] text-stone-400">Chime and warn if leaving tab during focus</span>
              </div>
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">Tab Switch Audio Alert</span>
                <span className="text-[10px] text-stone-400">Play alert sound when leaving tab during focus</span>
              </div>
              <input
                type="checkbox"
                checked={tabSwitchAlert}
                onChange={(e) => setTabSwitchAlert(e.target.checked)}
                className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Auto-start Breaks</span>
              <input
                type="checkbox"
                checked={autoStartBreaks}
                onChange={(e) => setAutoStartBreaks(e.target.checked)}
                className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Auto-start Work Sessions</span>
              <input
                type="checkbox"
                checked={autoStartWork}
                onChange={(e) => setAutoStartWork(e.target.checked)}
                className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
              />
            </div>
          </div>

          {/* Audio Chime Settings */}
          <div className="flex flex-col gap-3 pt-2 border-t border-stone-800/40">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-400">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Alarm Chime Volume</span>
              </div>
              <span>{Math.round(alarmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={alarmVolume}
              onChange={(e) => setAlarmVolume(parseFloat(e.target.value))}
              className="w-full accent-[#FF6B00] cursor-pointer"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => playAlertChime(alarmVolume)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isLight ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800' : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Test Alert Chime</span>
              </button>

              <button
                type="button"
                onClick={() => playTabWarningTone(alarmVolume)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isLight ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800' : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Test Tab Switch Alert</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="btn-primary-orange w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg hover:shadow-orange-500/20 active:scale-[0.99] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </form>
      </div>
    </div>
  );
}
