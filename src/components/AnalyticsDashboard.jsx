import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Edit2, 
  Trash2, 
  BarChart3, 
  Target, 
  Anchor, 
  Zap, 
  Quote, 
  Save, 
  History, 
  Sparkles
} from 'lucide-react';

export default function AnalyticsDashboard({ onOpenAddCategory, onOpenEditCategory }) {
  const { 
    theme, 
    stats, 
    categories, 
    deleteCategory, 
    favouriteQuote, 
    saveQuote, 
    sessionHistory 
  } = useTimer();

  const isLight = theme === 'Dawn Glow';

  // Simplified Motivational Quote editing state
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const defaultFallbackQuote = "Either you conquer the day, or the day buries you.";
  const currentQuoteText = typeof favouriteQuote === 'string' 
    ? (favouriteQuote === "Deep work is the superpower of the 21st century." ? defaultFallbackQuote : favouriteQuote) 
    : (favouriteQuote?.text === "Deep work is the superpower of the 21st century." ? defaultFallbackQuote : (favouriteQuote?.text || defaultFallbackQuote));
  const [quoteText, setQuoteText] = useState(currentQuoteText);

  // Session History modal state
  const [showHistory, setShowHistory] = useState(false);

  const handleSaveQuote = (e) => {
    e.preventDefault();
    if (!quoteText.trim()) return;
    saveQuote(quoteText.trim());
    setIsEditingQuote(false);
  };

  // AI-like dynamic summary generation based on daily completion
  const getAiSummary = () => {
    const todayMins = stats.todayMinutes || 0;
    const hours = (todayMins / 60).toFixed(1);

    if (todayMins >= 180) {
      return `Masterful discipline! You've anchored ${hours} hours of deep flow today. You are operating at peak cognitive potential.`;
    } else if (todayMins >= 120) {
      return `Great flow! You've anchored ${hours} hours of deep work today. Consistency is compounding into excellence.`;
    } else if (todayMins >= 60) {
      return `Strong momentum! You've anchored ${hours} hour of high-focus study. One more session to reach daily mastery.`;
    } else if (todayMins > 0) {
      return `First anchor dropped! You've clocked ${todayMins} minutes of concentrated attention today.`;
    }
    return `Ready to dive? Anchor your attention for your first session of the day.`;
  };

  // Gamified Badges with enhanced base visibility for locked state
  const badges = [
    {
      id: 'badge-1',
      title: 'First Anchor',
      desc: 'Complete 1 session',
      unlocked: (stats.totalSessions || 0) >= 1,
      icon: Anchor,
      glow: false
    },
    {
      id: 'badge-streak-3',
      title: 'Iron Anchor',
      desc: '3-day focus streak',
      unlocked: (stats.currentStreak || 0) >= 3,
      icon: Anchor,
      glow: true // Glowing anchor icon for 3-day streak
    },
    {
      id: 'badge-hours',
      title: 'Deep Voyager',
      desc: '5+ hours focused',
      unlocked: (stats.totalMinutes || 0) >= 300,
      icon: Zap,
      glow: false
    },
    {
      id: 'badge-streak-7',
      title: 'Flow Master',
      desc: '7-day focus streak',
      unlocked: (stats.currentStreak || 0) >= 7,
      icon: Flame,
      glow: true
    }
  ];

  return (
    <div className={`h-full flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all gap-5 ${
      isLight ? 'glass-panel-dawn text-stone-900' : 'glass-panel-ember text-white'
    }`}>
      {/* 1. Section: "Your Progress" */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="text-lg font-black tracking-tight">Your Progress</h2>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              isLight 
                ? 'bg-white/80 border-stone-300 text-stone-700 hover:bg-stone-100' 
                : 'bg-black/40 border-stone-800 text-stone-300 hover:text-white hover:border-[#FF6B00]/40'
            }`}
          >
            <History className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Session History</span>
          </button>
        </div>

        {/* 3 Metric Summary Cards with Dynamic Continuous Micro-Icon Animations */}
        <div className="grid grid-cols-3 gap-3">
          {/* Focus Sessions */}
          <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
            isLight
              ? 'bg-white/80 border-stone-200 shadow-sm'
              : 'bg-black/40 border-stone-800/80'
          }`}>
            <div className="h-6 flex items-center justify-center mb-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse-glow-icon" />
            </div>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#FF6B00]">
              {stats.totalSessions || 0}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isLight ? 'text-stone-500' : 'text-stone-400'
            }`}>
              Focus Sessions
            </span>
          </div>

          {/* Minutes Focused (Dynamic Real-Time Live Tracking Metric) */}
          <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
            isLight
              ? 'bg-white/80 border-stone-200 shadow-sm'
              : 'bg-black/40 border-stone-800/80'
          }`}>
            <div className="h-6 flex items-center justify-center mb-0.5">
              <Clock className="w-4 h-4 text-blue-400 animate-spin-slow" />
            </div>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#FF6B00]">
              {stats.totalMinutes || 0}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isLight ? 'text-stone-500' : 'text-stone-400'
            }`}>
              Minutes Focused
            </span>
          </div>

          {/* Day Streak */}
          <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
            isLight
              ? 'bg-white/80 border-stone-200 shadow-sm'
              : 'bg-black/40 border-stone-800/80'
          }`}>
            <div className="h-6 flex items-center justify-center mb-0.5">
              <Flame className="w-4 h-4 text-amber-400 animate-flame-flicker" />
            </div>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#FF6B00]">
              {stats.currentStreak || 0}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isLight ? 'text-stone-500' : 'text-stone-400'
            }`}>
              Day Streak
            </span>
          </div>
        </div>

        {/* Gamified Digital Badges with High Base Visibility for Upcoming Milestones */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 pr-1">
          {badges.map((badge) => {
            const IconComponent = badge.icon;
            const isUnlocked = badge.unlocked;

            return (
              <div
                key={badge.id}
                title={`${badge.title} — ${badge.desc} (${isUnlocked ? 'Unlocked' : 'Locked Milestone'})`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                  isUnlocked
                    ? badge.glow
                      ? 'bg-[#FF6B00]/25 border-[#FF6B00]/60 text-white shadow-[0_0_16px_rgba(255,107,0,0.55)] ring-1.5 ring-[#FF6B00]'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : isLight
                    ? 'bg-white/90 border-stone-300/80 text-stone-700 shadow-sm hover:border-stone-400'
                    : 'bg-[#141419]/90 border-white/15 text-stone-200 shadow-sm hover:border-white/25'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-transform ${
                  isUnlocked 
                    ? badge.glow 
                      ? 'bg-[#FF6B00] text-white animate-pulse' 
                      : 'bg-emerald-500/20 text-emerald-400'
                    : isLight 
                    ? 'bg-stone-200 text-stone-600' 
                    : 'bg-white/10 text-stone-400'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold block leading-tight">{badge.title}</span>
                    {!isUnlocked && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        isLight ? 'bg-stone-200 text-stone-600' : 'bg-white/10 text-stone-400'
                      }`}>
                        Locked
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium block mt-0.5 ${
                    isUnlocked ? 'opacity-80' : isLight ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    {badge.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI-like Summary Text Box */}
        <div className={`p-3 rounded-2xl border flex items-start gap-2.5 transition-all ${
          isLight
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-[#FF6B00]/10 border-[#FF6B00]/30 text-stone-200'
        }`}>
          <Sparkles className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5 animate-pulse" />
          <p className="text-xs font-medium leading-relaxed">
            {getAiSummary()}
          </p>
        </div>
      </div>

      {/* 2. Section: "Focus Allocation" */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FF6B00]" />
            <h3 className="text-sm font-black tracking-tight">Focus Allocation</h3>
          </div>

          <button
            onClick={onOpenAddCategory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold btn-primary-orange shadow-md"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Category Rows with Inline Edit/Delete on Hover */}
        <div className="flex flex-col gap-2.5 max-h-[175px] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const compHours = Number(cat.completedHours) || 0;
            const goalH = Number(cat.goalHours) || 1;
            const pct = Math.min(100, Math.round((compHours / goalH) * 100)) || 0;

            return (
              <div 
                key={cat.id} 
                className={`group p-2.5 rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-white/70 border-stone-200 hover:border-stone-300'
                    : 'bg-black/30 border-stone-800/60 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span className="text-xs font-bold">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold opacity-90">
                      {compHours.toFixed(1)} / {goalH.toFixed(1)} hrs/wk
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF6B00]">
                      {pct}%
                    </span>

                    {/* Inline Edit/Delete on Hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onOpenEditCategory(cat)}
                        title="Edit Category"
                        className="p-1 rounded hover:bg-stone-500/20 text-stone-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {categories.length > 1 && (
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          title="Delete Category"
                          className="p-1 rounded hover:bg-red-500/20 text-stone-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isLight ? 'bg-stone-200' : 'bg-stone-800'
                }`}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color || '#FF6B00'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Section: "Favourite Quote" (British English, Quote Space Only, No Author Field) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isLight
          ? 'bg-amber-500/10 border-amber-500/20 text-stone-800'
          : 'bg-black/40 border-stone-800 text-stone-300'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span className="text-xs font-black tracking-tight uppercase text-[#FF6B00]">
              Favourite Quote
            </span>
          </div>

          <button
            onClick={() => {
              setQuoteText(currentQuoteText);
              setIsEditingQuote(!isEditingQuote);
            }}
            className="text-[11px] font-bold text-stone-400 hover:text-white transition-colors"
          >
            {isEditingQuote ? 'Cancel' : 'Edit Quote'}
          </button>
        </div>

        {isEditingQuote ? (
          <form onSubmit={handleSaveQuote} className="flex flex-col gap-2.5 mt-2">
            <textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              rows={2}
              required
              className={`w-full p-2.5 rounded-xl text-xs outline-none border resize-none transition-colors ${
                isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-black/50 border-stone-700 text-white focus:border-[#FF6B00]'
              }`}
              placeholder="Enter your favourite motivational quote..."
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold btn-primary-orange flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Quote</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-1">
            <p className="text-xs font-medium italic">
              "{currentQuoteText}"
            </p>
          </div>
        )}
      </div>

      {/* Session History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border transition-all ${
            isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-[#0F0F14] border-stone-800 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-base font-black tracking-tight">Session History</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400 mb-3">
              Your completed focus sessions:
            </p>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {sessionHistory && sessionHistory.length > 0 ? (
                sessionHistory.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isLight ? 'bg-stone-100 border-stone-200' : 'bg-black/40 border-stone-800'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">{sess.categoryName}</span>
                      <span className="text-[10px] text-stone-500">
                        {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(sess.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#FF6B00]">
                      +{sess.minutes}m
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-stone-500">
                  No sessions recorded yet. Start your first session!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
