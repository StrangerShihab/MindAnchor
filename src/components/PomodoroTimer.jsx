import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Layers, 
  Wind, 
  Eye, 
  Clock, 
  AlertCircle,
  X
} from 'lucide-react';

export default function PomodoroTimer() {
  const {
    theme,
    mode,
    switchMode,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipMode,
    timeLeft,
    settings,
    categories,
    selectedCategory,
    setSelectedCategory,
    breakExercise,
    setBreakExercise,
    focusLockWarning,
    setFocusLockWarning
  } = useTimer();

  const isLight = theme === 'Dawn Glow';

  // Box breathing states (4s Inhale, 4s Hold, 4s Exhale, 4s Hold = 16s cycle)
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);

  useEffect(() => {
    if (breakExercise !== 'box_breathing') return;

    const interval = setInterval(() => {
      setBreathSeconds(prev => {
        if (prev <= 1) {
          setBreathPhase(curr => {
            if (curr === 'Inhale') return 'Hold (Full)';
            if (curr === 'Hold (Full)') return 'Exhale';
            if (curr === 'Exhale') return 'Hold (Empty)';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breakExercise]);

  // Eye Care 20-20-20 step timer
  const [eyeStepTime, setEyeStepTime] = useState(20);
  useEffect(() => {
    if (breakExercise !== 'eye_care') return;
    const interval = setInterval(() => {
      setEyeStepTime(prev => (prev > 0 ? prev - 1 : 20));
    }, 1000);
    return () => clearInterval(interval);
  }, [breakExercise]);

  // Calculate total duration for progress ring
  const totalSeconds = mode === 'work'
    ? settings.workDuration * 60
    : mode === 'break'
    ? settings.breakDuration * 60
    : settings.longBreakDuration * 60;

  const progressFraction = Math.max(0, Math.min(1, timeLeft / totalSeconds));
  const radius = 122;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressFraction);

  // Format time display MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isBreak = mode === 'break' || mode === 'longbreak';

  return (
    <div className={`h-full flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all relative ${
      isLight ? 'glass-panel-dawn text-stone-900' : 'glass-panel-ember text-white'
    }`}>
      {/* Repositioned Tab-Switch Notification Overlay: Fixed Non-Critical Bottom-Right Corner */}
      {focusLockWarning && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 p-4 rounded-2xl bg-[#0F0F14]/95 border border-[#FF6B00]/40 text-white shadow-2xl shadow-black/80 backdrop-blur-xl flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#FF6B00]/20 text-[#FF6B00] shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block text-white">Tab Switch Detected</span>
              <span className="text-[11px] font-medium text-stone-300 block mt-0.5">
                Stay focused! Anchor your attention on your current session.
              </span>
            </div>
          </div>
          <button 
            onClick={() => setFocusLockWarning(false)}
            className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Mode Selector Tabs & Session Allocation */}
      <div>
        <nav className={`flex p-1.5 rounded-full border ${
          isLight ? 'bg-stone-200/60 border-stone-300' : 'bg-black/40 border-stone-800'
        }`}>
          <button
            onClick={() => switchMode('work')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'work'
                ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30'
                : isLight ? 'text-stone-600 hover:text-stone-900' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mode === 'work' ? 'bg-white' : 'bg-current opacity-40'}`} />
            Focus Work
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'break'
                ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30'
                : isLight ? 'text-stone-600 hover:text-stone-900' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mode === 'break' ? 'bg-white' : 'bg-current opacity-40'}`} />
            Short Break
          </button>
          <button
            onClick={() => switchMode('longbreak')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'longbreak'
                ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30'
                : isLight ? 'text-stone-600 hover:text-stone-900' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mode === 'longbreak' ? 'bg-white' : 'bg-current opacity-40'}`} />
            Long Break
          </button>
        </nav>

        {/* Sole Session Allocation Field: "Allocate This Session To" */}
        <div className="mt-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF6B00] shrink-0" />
          <span className="text-xs font-bold tracking-tight whitespace-nowrap opacity-90">
            Allocate This Session To
          </span>
          <div className="flex-1 relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full appearance-none px-3 py-2 pr-8 rounded-xl text-xs font-bold outline-none cursor-pointer border transition-all ${
                isLight
                  ? 'bg-white text-stone-900 border-stone-300 shadow-sm'
                  : 'bg-[#0F0F14] text-white border-stone-700 focus:border-[#FF6B00]'
              }`}
              style={{
                backgroundColor: isLight ? '#FFFFFF' : '#0F0F14',
                color: isLight ? '#1C1917' : '#FFFFFF'
              }}
            >
              {categories.map((cat) => (
                <option 
                  key={cat.id} 
                  value={cat.id}
                  style={{
                    backgroundColor: isLight ? '#FFFFFF' : '#0F0F14',
                    color: isLight ? '#1C1917' : '#FFFFFF'
                  }}
                >
                  {cat.name} ({Number(cat.completedHours || 0).toFixed(1)}h / {Number(cat.goalHours || 0).toFixed(1)}h)
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Smart Break Exercises Selector (Visible during breaks) */}
        {isBreak && (
          <div className="mt-3 flex items-center justify-center gap-2 p-1 rounded-2xl bg-black/20 border border-white/5">
            <button
              onClick={() => setBreakExercise('none')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                breakExercise === 'none'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Standard Timer</span>
            </button>
            <button
              onClick={() => setBreakExercise('box_breathing')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                breakExercise === 'box_breathing'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Wind className="w-3 h-3" />
              <span>Box Breathing</span>
            </button>
            <button
              onClick={() => setBreakExercise('eye_care')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                breakExercise === 'eye_care'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Eye Care 20-20-20</span>
            </button>
          </div>
        )}
      </div>

      {/* Center Display: Timer / Box Breathing / Eye Care */}
      <div className="my-6 flex flex-col items-center justify-center">
        {isBreak && breakExercise === 'box_breathing' ? (
          /* Smart Break Exercise: Box Breathing Animation Loop */
          <div className="w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-center relative">
            <div 
              className={`w-44 h-44 rounded-full border-4 border-[#FF6B00] flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl ${
                breathPhase === 'Inhale'
                  ? 'scale-125 bg-[#FF6B00]/25 shadow-[0_0_30px_rgba(255,107,0,0.6)]'
                  : breathPhase === 'Hold (Full)'
                  ? 'scale-125 bg-[#FF8C33]/20 shadow-[0_0_20px_rgba(255,140,51,0.5)]'
                  : breathPhase === 'Exhale'
                  ? 'scale-90 bg-[#FF6B00]/10 shadow-[0_0_10px_rgba(255,107,0,0.3)]'
                  : 'scale-90 bg-black/20'
              }`}
            >
              <Wind className="w-6 h-6 text-[#FF6B00] mb-1 animate-pulse" />
              <span className="text-base font-extrabold uppercase tracking-wider text-[#FF6B00]">
                {breathPhase}
              </span>
              <span className="font-mono text-3xl font-bold mt-1">
                {breathSeconds}s
              </span>
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-stone-400 block">
                4-4-4-4 Box Breathing Recovery Loop
              </span>
              <span className="text-[11px] font-mono text-[#FF6B00] font-semibold">
                Break Remaining: {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        ) : isBreak && breakExercise === 'eye_care' ? (
          /* Smart Break Exercise: Eye Care 20-20-20 */
          <div className="w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-center text-center p-4">
            <div className="w-20 h-20 rounded-full bg-[#FF6B00]/20 border-2 border-[#FF6B00] flex items-center justify-center mb-3 shadow-[0_0_24px_rgba(255,107,0,0.4)]">
              <Eye className="w-8 h-8 text-[#FF6B00] animate-pulse" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#FF6B00]">
              20-20-20 Eye Care Protocol
            </h4>
            <p className="text-xs font-medium text-stone-400 mt-1 max-w-[220px]">
              Look at an object at least 20 feet away for 20 seconds.
            </p>
            <div className="mt-3 py-1 px-3 rounded-full bg-black/40 border border-stone-800 font-mono text-xs font-bold text-[#FF6B00]">
              Focus Distance Timer: {eyeStepTime}s
            </div>
            <span className="text-[10px] font-mono text-stone-500 mt-2">
              Break Remaining: {formatTime(timeLeft)}
            </span>
          </div>
        ) : (
          /* Standard Circular Timer Ring with High-Contrast Typography */
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
              {/* Ring Background */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                className="fill-none stroke-current opacity-10"
                strokeWidth="10"
              />
              {/* Animated Progress Bar Ring */}
              <circle
                cx="140"
                cy="140"
                r={radius}
                className="fill-none transition-all duration-700 ease-out"
                stroke="#FF6B00"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(255, 107, 0, 0.4))'
                }}
              />
            </svg>

            {/* Clock Display Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00] mb-1">
                {mode === 'work' ? 'Focus Session' : mode === 'break' ? 'Short Break' : 'Long Break'}
              </span>
              <span className="font-mono text-6xl font-bold tracking-tight drop-shadow-[0_2px_8px_rgba(255,107,0,0.15)]">
                {formatTime(timeLeft)}
              </span>
              {/* Dynamic Mode-Based Subtitle */}
              <span className={`text-xs mt-2.5 font-bold tracking-wide transition-colors ${
                isLight 
                  ? 'text-stone-800 drop-shadow-sm' 
                  : 'text-stone-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]'
              }`}>
                {mode === 'work' ? (
                  <>Lock In & <span className="text-[#FF6B00] font-extrabold">Build</span></>
                ) : mode === 'break' ? (
                  <>Unplug & <span className="text-[#FF6B00] font-extrabold">Recharge</span></>
                ) : (
                  <>Mastery Needs <span className="text-[#FF6B00] font-extrabold">Rest</span></>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls: Start / Pause / Reset / Skip */}
      <div className="flex items-center justify-center gap-4 pb-2">
        <button
          onClick={resetTimer}
          title="Reset Timer"
          aria-label="Reset Timer"
          className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
            isLight
              ? 'bg-stone-200/80 border-stone-300 text-stone-700 hover:bg-stone-300 shadow-sm'
              : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/15 hover:text-white'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="btn-primary-orange px-8 py-3.5 rounded-full font-bold text-base tracking-wider flex items-center gap-3 uppercase shadow-lg"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          onClick={skipMode}
          title="Skip to Next Mode"
          aria-label="Skip to Next Mode"
          className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
            isLight
              ? 'bg-stone-200/80 border-stone-300 text-stone-700 hover:bg-stone-300 shadow-sm'
              : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/15 hover:text-white'
          }`}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
