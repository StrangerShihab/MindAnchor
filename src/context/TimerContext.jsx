import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase/config';

const TimerContext = createContext();

export const useTimer = () => useContext(TimerContext);

// Strict default categories: 0 completed hours
const DEFAULT_CATEGORIES = [
  { id: 'cat-deepwork', name: 'Deep Work', goalHours: 40, completedHours: 0, color: '#FF6B00' },
  { id: 'cat-coding', name: 'Coding', goalHours: 20, completedHours: 0, color: '#3B82F6' },
  { id: 'cat-academics', name: 'Academics', goalHours: 15, completedHours: 0, color: '#10B981' },
];

const DEFAULT_SETTINGS = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartWork: false,
  alarmVolume: 0.8,
  strictMode: true,
  tabSwitchAlert: true,
};

// Strict initial statistics: start strictly at 0 (Zero)
const DEFAULT_STATS = {
  totalSessions: 0,
  totalMinutes: 0,
  todayMinutes: 0,
  currentStreak: 0,
  lastActiveDate: null,
  activeDates: []
};

// Default Motivational Quote
const DEFAULT_QUOTE = "Either you conquer the day, or the day buries you.";

export const TimerProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Settings & Theme ('Ember Live' | 'Dawn Glow' | 'Obsidian Static')
  const [theme, setTheme] = useState(() => localStorage.getItem('mindanchor_theme') || 'Ember Live');
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('mindanchor_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  // Categories & Stats - strictly initialized to 0
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('mindanchor_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [selectedCategory, setSelectedCategory] = useState('cat-deepwork');

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('mindanchor_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.totalSessions === 12 && parsed.totalMinutes === 300) {
          return DEFAULT_STATS;
        }
        return {
          totalSessions: parsed.totalSessions || 0,
          totalMinutes: parsed.totalMinutes || 0,
          todayMinutes: parsed.todayMinutes || 0,
          currentStreak: parsed.currentStreak || 0,
          lastActiveDate: parsed.lastActiveDate || null,
          activeDates: Array.isArray(parsed.activeDates) ? parsed.activeDates : []
        };
      } catch (e) {
        return DEFAULT_STATS;
      }
    }
    return DEFAULT_STATS;
  });

  // Motivational Favourite Quote
  const [favouriteQuote, setFavouriteQuote] = useState(() => {
    const saved = localStorage.getItem('mindanchor_quote');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const text = typeof parsed === 'string' ? parsed : (parsed.text || DEFAULT_QUOTE);
        if (text === "Deep work is the superpower of the 21st century.") {
          return DEFAULT_QUOTE;
        }
        return text;
      } catch (e) {
        if (saved === "Deep work is the superpower of the 21st century.") {
          return DEFAULT_QUOTE;
        }
        return saved;
      }
    }
    return DEFAULT_QUOTE;
  });

  // Session History strictly empty for new users
  const [sessionHistory, setSessionHistory] = useState(() => {
    const saved = localStorage.getItem('mindanchor_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id === 'sess-1') {
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Timer State
  const [mode, setMode] = useState('work'); // 'work' | 'break' | 'longbreak'
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);

  // Track live elapsed seconds within current focus session to update Minutes Focused in real time
  const focusSecondsElapsedRef = useRef(0);

  // Smart Break Exercise mode: 'none' | 'box_breathing' | 'eye_care'
  const [breakExercise, setBreakExercise] = useState('none');
  const [showBreakModal, setShowBreakModal] = useState(false);

  // Focus Lock / Tab Visibility Toast
  const [focusLockWarning, setFocusLockWarning] = useState(false);

  // Online / Offline Detection
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  // Cloud Sync Indicator State: 'saving' | 'synced' | 'offline'
  const [syncStatus, setSyncStatus] = useState(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline';
    return currentUser ? 'synced' : 'offline';
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (currentUser) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Actual Session Alert Chime (Bell Chime Sequence) - scales dynamically (0.0 to 1.0)
  const playAlertChime = (overrideVol) => {
    try {
      const vol = typeof overrideVol === 'number'
        ? overrideVol
        : (settings.alarmVolume !== undefined ? settings.alarmVolume : 0.8);
      if (vol <= 0) return; // Silent at 0 volume

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const clampedVol = Math.max(0, Math.min(1, vol));

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 harmonic bells
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.15);
        gain.gain.linearRampToValueAtTime(0.3 * clampedVol, ctx.currentTime + index * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.15 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.15);
        osc.stop(ctx.currentTime + index * 0.15 + 1.2);
      });
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  // Subtle, Clear Tab-Switch Warning Tone - scales dynamically (0.0 to 1.0)
  const playTabWarningTone = (overrideVol) => {
    try {
      const vol = typeof overrideVol === 'number'
        ? overrideVol
        : (settings.alarmVolume !== undefined ? settings.alarmVolume : 0.8);
      if (vol <= 0) return; // Silent at 0 volume

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const clampedVol = Math.max(0, Math.min(1, vol));

      // Soft high-clarity dual ping (587.33Hz D5 -> 880Hz A5)
      const pings = [587.33, 880.00];
      pings.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.25 * clampedVol, ctx.currentTime + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.35);
      });
    } catch (e) {
      console.error("Audio warning error:", e);
    }
  };

  // Focus Lock (Strict Mode) page visibility detection - triggers subtle clear warning tone if enabled
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && mode === 'work' && settings.strictMode) {
        if (settings.tabSwitchAlert !== false) {
          playTabWarningTone();
        }
        setFocusLockWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, mode, settings.strictMode, settings.alarmVolume, settings.tabSwitchAlert]);

  // Sync settings duration when mode or settings change (if timer not running)
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'work') setTimeLeft(settings.workDuration * 60);
      else if (mode === 'break') setTimeLeft(settings.breakDuration * 60);
      else if (mode === 'longbreak') setTimeLeft(settings.longBreakDuration * 60);
      focusSecondsElapsedRef.current = 0;
    }
  }, [mode, settings.workDuration, settings.breakDuration, settings.longBreakDuration]);

  // Persist local state changes
  useEffect(() => {
    localStorage.setItem('mindanchor_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mindanchor_settings', JSON.stringify(settings));
    triggerCloudSave();
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mindanchor_categories', JSON.stringify(categories));
    triggerCloudSave();
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mindanchor_stats', JSON.stringify(stats));
    triggerCloudSave();
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('mindanchor_quote', JSON.stringify(favouriteQuote));
    triggerCloudSave();
  }, [favouriteQuote]);

  useEffect(() => {
    localStorage.setItem('mindanchor_history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  // Supabase Database Sync: Load immediately on Auth change & clear guest stale state
  useEffect(() => {
    let isCancelled = false;

    const loadUserData = async () => {
      if (!currentUser) {
        setSyncStatus('offline');
        return;
      }
      setSyncStatus('saving');

      try {
        const userId = currentUser.id || currentUser.uid;
        const { data, error } = await supabase
          .from('user_data')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (isCancelled) return;

        if (error && error.code !== 'PGRST116') {
          console.warn('[MindAnchor Supabase] Load note:', error.message);
        }

        if (data) {
          // Immediately populate state with fresh Supabase data across UI
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
            localStorage.setItem('mindanchor_categories', JSON.stringify(data.categories));
          }
          if (data.stats) {
            const freshStats = {
              totalSessions: data.stats.totalSessions || 0,
              totalMinutes: data.stats.totalMinutes || 0,
              todayMinutes: data.stats.todayMinutes || 0,
              currentStreak: data.stats.currentStreak || 0,
              lastActiveDate: data.stats.lastActiveDate || null,
              activeDates: Array.isArray(data.stats.activeDates) ? data.stats.activeDates : []
            };
            setStats(freshStats);
            localStorage.setItem('mindanchor_stats', JSON.stringify(freshStats));
          }
          if (data.theme) {
            setTheme(data.theme);
            localStorage.setItem('mindanchor_theme', data.theme);
          }
          if (data.settings) {
            setSettings(prev => {
              const merged = { ...prev, ...data.settings };
              localStorage.setItem('mindanchor_settings', JSON.stringify(merged));
              return merged;
            });
          }
          if (data.favourite_quote || data.favouriteQuote) {
            const rawQuote = data.favourite_quote || data.favouriteQuote;
            const text = typeof rawQuote === 'string' ? rawQuote : (rawQuote.text || DEFAULT_QUOTE);
            setFavouriteQuote(text);
            localStorage.setItem('mindanchor_quote', JSON.stringify(text));
          }
          if (data.session_history || data.sessionHistory) {
            const history = data.session_history || data.sessionHistory || [];
            setSessionHistory(history);
            localStorage.setItem('mindanchor_history', JSON.stringify(history));
          }
        } else {
          // New User Account: Clear stale guest data and initialize fresh records
          const freshCategories = DEFAULT_CATEGORIES;
          const freshStats = DEFAULT_STATS;
          const freshHistory = [];
          const freshQuote = DEFAULT_QUOTE;

          setCategories(freshCategories);
          setStats(freshStats);
          setSessionHistory(freshHistory);
          setFavouriteQuote(freshQuote);

          localStorage.setItem('mindanchor_categories', JSON.stringify(freshCategories));
          localStorage.setItem('mindanchor_stats', JSON.stringify(freshStats));
          localStorage.setItem('mindanchor_history', JSON.stringify(freshHistory));
          localStorage.setItem('mindanchor_quote', JSON.stringify(freshQuote));

          // Upsert fresh data row to Supabase
          await supabase.from('user_data').upsert({
            user_id: userId,
            categories: freshCategories,
            stats: freshStats,
            theme,
            settings,
            favourite_quote: freshQuote,
            session_history: freshHistory,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        }
        setSyncStatus('synced');
      } catch (err) {
        console.warn('[MindAnchor Supabase] Sync catch:', err);
        setSyncStatus('offline');
      }
    };

    loadUserData();

    // Setup real-time postgres listener on user_data for instant cross-tab / cross-device updates
    const userId = currentUser?.id || currentUser?.uid;
    let channel = null;
    if (userId) {
      channel = supabase
        .channel(`user_data_${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_data', filter: `user_id=eq.${userId}` },
          (payload) => {
            if (payload.new && !isCancelled) {
              const d = payload.new;
              if (d.categories) setCategories(d.categories);
              if (d.stats) setStats(d.stats);
              if (d.settings) setSettings(prev => ({ ...prev, ...d.settings }));
              if (d.theme) setTheme(d.theme);
              if (d.favourite_quote) setFavouriteQuote(d.favourite_quote);
              if (d.session_history) setSessionHistory(d.session_history);
            }
          }
        )
        .subscribe();
    }

    return () => {
      isCancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser]);

  // Cloud Save Trigger using Supabase upsert
  const triggerCloudSave = async () => {
    if (!currentUser) {
      setSyncStatus('offline');
      return;
    }
    setSyncStatus('saving');
    try {
      const userId = currentUser.id || currentUser.uid;
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          categories,
          stats,
          theme,
          settings,
          favourite_quote: favouriteQuote,
          session_history: sessionHistory,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('[MindAnchor Supabase Save Warning]:', error.message);
        setSyncStatus('offline');
      } else {
        setSyncStatus('synced');
      }
    } catch (err) {
      console.warn('[MindAnchor Supabase Save Error]:', err);
      setSyncStatus('offline');
    }
  };

  // Complete a Pomodoro Session
  const handleSessionComplete = () => {
    playAlertChime();

    if (mode === 'work') {
      const sessionMins = settings.workDuration;
      const matchedCat = categories.find(c => c.id === selectedCategory);
      const catName = matchedCat ? matchedCat.name : 'Focus Session';

      // Add to Session History
      const newSession = {
        id: `sess-${Date.now()}`,
        categoryName: catName,
        minutes: sessionMins,
        timestamp: Date.now()
      };
      setSessionHistory(prev => [newSession, ...prev.slice(0, 19)]);

      // Update Streak & Total Sessions (Minutes are already accumulated live each minute)
      const today = new Date().toISOString().split('T')[0];
      setStats(prev => {
        let newStreak = prev.currentStreak || 0;

        if (prev.lastActiveDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (prev.lastActiveDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        } else if (newStreak === 0) {
          newStreak = 1;
        }

        const existingDates = Array.isArray(prev.activeDates) ? prev.activeDates : [];
        const nextDates = existingDates.includes(today) ? existingDates : [...existingDates, today];

        return {
          ...prev,
          totalSessions: (prev.totalSessions || 0) + 1,
          currentStreak: newStreak,
          lastActiveDate: today,
          activeDates: nextDates
        };
      });

      // Switch to Break mode & offer Smart Break Exercise
      focusSecondsElapsedRef.current = 0;
      setMode('break');
      setTimeLeft(settings.breakDuration * 60);
      setShowBreakModal(true);
      setBreakExercise('box_breathing');

      if (settings.autoStartBreaks) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else {
      // Break completed -> back to work
      focusSecondsElapsedRef.current = 0;
      setBreakExercise('none');
      setShowBreakModal(false);
      setMode('work');
      setTimeLeft(settings.workDuration * 60);

      if (settings.autoStartWork) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }
  };

  // Timer Tick Interval + Dynamic Real-Time Tracking ("Minutes Focused")
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);

        // Dynamic Real-Time Tracking: Update every 1 full minute (60s) of active focus
        if (mode === 'work') {
          focusSecondsElapsedRef.current += 1;

          if (focusSecondsElapsedRef.current >= 60) {
            focusSecondsElapsedRef.current = 0;

            // Increment Minutes Focused live
            setStats(prev => {
              const today = new Date().toISOString().split('T')[0];
              return {
                ...prev,
                totalMinutes: (prev.totalMinutes || 0) + 1,
                todayMinutes: (prev.todayMinutes || 0) + 1,
                lastActiveDate: today
              };
            });

            // Increment Category Completed Hours live (+1/60 hr)
            setCategories(prev => prev.map(cat => {
              if (cat.id === selectedCategory) {
                return {
                  ...cat,
                  completedHours: parseFloat(((cat.completedHours || 0) + (1 / 60)).toFixed(2))
                };
              }
              return cat;
            }));
          }
        }
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleSessionComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, selectedCategory]);

  // Actions
  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    focusSecondsElapsedRef.current = 0;
    if (mode === 'work') setTimeLeft(settings.workDuration * 60);
    else if (mode === 'break') setTimeLeft(settings.breakDuration * 60);
    else setTimeLeft(settings.longBreakDuration * 60);
  };

  const skipMode = () => {
    setIsRunning(false);
    focusSecondsElapsedRef.current = 0;
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(settings.breakDuration * 60);
      setShowBreakModal(true);
      setBreakExercise('box_breathing');
    } else {
      setMode('work');
      setTimeLeft(settings.workDuration * 60);
      setBreakExercise('none');
      setShowBreakModal(false);
    }
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    focusSecondsElapsedRef.current = 0;
    setMode(newMode);
    if (newMode === 'work') {
      setTimeLeft(settings.workDuration * 60);
      setBreakExercise('none');
      setShowBreakModal(false);
    } else if (newMode === 'break') {
      setTimeLeft(settings.breakDuration * 60);
      setBreakExercise('box_breathing');
    } else {
      setTimeLeft(settings.longBreakDuration * 60);
      setBreakExercise('eye_care');
    }
  };

  // Category CRUD
  const addCategory = (categoryData) => {
    const newCat = {
      id: `cat-${Date.now()}`,
      name: categoryData.name,
      goalHours: parseFloat(categoryData.goalHours),
      completedHours: 0,
      color: categoryData.color || '#FF6B00'
    };
    setCategories(prev => [...prev, newCat]);
    setSelectedCategory(newCat.id);
  };

  const updateCategory = (id, updatedData) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const deleteCategory = (id) => {
    if (categories.length <= 1) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    if (selectedCategory === id) {
      const remaining = categories.filter(c => c.id !== id);
      setSelectedCategory(remaining[0]?.id || '');
    }
  };

  // Save Favourite Quote
  const saveQuote = (quoteText) => {
    const textToSave = typeof quoteText === 'string' ? quoteText : (quoteText?.text || DEFAULT_QUOTE);
    setFavouriteQuote(textToSave);
  };

  const value = {
    theme,
    setTheme,
    settings,
    setSettings,
    categories,
    selectedCategory,
    setSelectedCategory,
    stats,
    mode,
    isRunning,
    timeLeft,
    syncStatus,
    isOnline,
    favouriteQuote,
    saveQuote,
    sessionHistory,
    breakExercise,
    setBreakExercise,
    showBreakModal,
    setShowBreakModal,
    focusLockWarning,
    setFocusLockWarning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipMode,
    switchMode,
    addCategory,
    updateCategory,
    deleteCategory,
    playAlertChime,
    playTabWarningTone
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};
