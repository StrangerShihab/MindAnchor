import React from 'react';
import { useTimer } from '../context/TimerContext';
import { Flame } from 'lucide-react';

export default function WeeklyStreak({ compact = false }) {
  const { theme, stats, sessionHistory } = useTimer();
  const isLight = theme === 'Dawn Glow';

  // Days sequence starting from Friday: 'Fr', 'Sa', 'Su', 'M', 'Tu', 'W', 'Th'
  const DAYS = [
    { label: 'Fr', full: 'Friday', dayIdx: 5 },
    { label: 'Sa', full: 'Saturday', dayIdx: 6 },
    { label: 'Su', full: 'Sunday', dayIdx: 0 },
    { label: 'M', full: 'Monday', dayIdx: 1 },
    { label: 'Tu', full: 'Tuesday', dayIdx: 2 },
    { label: 'W', full: 'Wednesday', dayIdx: 3 },
    { label: 'Th', full: 'Thursday', dayIdx: 4 },
  ];

  // Calculate dates for current weekly cycle starting from Friday
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Friday is dayIdx 5: calculate days elapsed since most recent Friday
  const daysSinceFriday = (currentDayOfWeek - 5 + 7) % 7;

  const friday = new Date(now);
  friday.setDate(now.getDate() - daysSinceFriday);
  friday.setHours(0, 0, 0, 0);

  // Set of active dates from stats & sessionHistory
  const activeDateSet = new Set(Array.isArray(stats.activeDates) ? stats.activeDates : []);
  if (sessionHistory && Array.isArray(sessionHistory)) {
    sessionHistory.forEach(sess => {
      if (sess.timestamp) {
        activeDateSet.add(new Date(sess.timestamp).toISOString().split('T')[0]);
      }
    });
  }
  // If user completed sessions today
  if (stats.lastActiveDate === todayStr && (stats.todayMinutes > 0 || (stats.totalSessions || 0) > 0)) {
    activeDateSet.add(todayStr);
  }

  // Count active days this cycle
  let activeThisWeekCount = 0;

  const weekDayData = DAYS.map((day, i) => {
    const d = new Date(friday);
    d.setDate(friday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === todayStr;
    const isActive = activeDateSet.has(dateStr);

    if (isActive) activeThisWeekCount++;

    return {
      ...day,
      dateStr,
      isToday,
      isActive,
    };
  });

  return (
    <div
      className={`flex items-center justify-between gap-3 px-3.5 py-1.5 sm:py-2 rounded-2xl border transition-all ${
        isLight
          ? 'bg-white/80 border-stone-200 shadow-sm text-stone-900'
          : 'bg-black/40 border-stone-800/80 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00]">
          <Flame className="w-3.5 h-3.5 animate-flame-flicker" />
        </div>
        <div className="hidden xs:block">
          <span className="text-[11px] font-extrabold tracking-tight block leading-tight">
            Weekly Focus Streak
          </span>
          <span className="text-[9px] font-semibold text-stone-400 block">
            {activeThisWeekCount} / 7 days active
          </span>
        </div>
      </div>

      {/* Horizontal Day Pills: 'Fr', 'Sa', 'Su', 'M', 'Tu', 'W', 'Th' with compact typography */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {weekDayData.map((d) => {
          return (
            <div
              key={d.label}
              title={`${d.full}: ${d.isActive ? 'Focus session completed' : 'No focus sessions'} ${d.isToday ? '(Today)' : ''}`}
              className={`relative flex flex-col items-center justify-center transition-all select-none rounded-lg sm:rounded-xl text-center font-extrabold tracking-tighter ${
                compact 
                  ? 'w-6 h-6 text-[9px] p-0' 
                  : 'w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-[10.5px] p-0.5'
              } ${
                d.isActive
                  ? 'bg-gradient-to-b from-[#FF7A1A] to-[#FF5500] text-white border border-[#FF8C33] shadow-[0_0_12px_rgba(255,107,0,0.65)]'
                  : isLight
                  ? 'bg-stone-100 border border-stone-200 text-stone-500'
                  : 'bg-white/5 border border-white/10 text-stone-400'
              } ${
                d.isToday
                  ? d.isActive
                    ? 'ring-2 ring-white/90 scale-105'
                    : 'ring-1.5 ring-[#FF6B00] border-[#FF6B00] text-[#FF6B00] font-black bg-[#FF6B00]/10 shadow-[0_0_8px_rgba(255,107,0,0.3)] scale-105'
                  : ''
              }`}
            >
              <span>{d.label}</span>
              {d.isToday && (
                <span
                  className={`absolute -bottom-0.5 w-1 h-1 rounded-full ${
                    d.isActive ? 'bg-white' : 'bg-[#FF6B00]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
