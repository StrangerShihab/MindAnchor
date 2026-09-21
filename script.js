/**
 * MindAnchor: Offline Study Pomodoro
 * High-performance, offline-first Vanilla JavaScript application.
 * 
 * Features:
 * - Robust interval management (clears existing timers before creation)
 * - LocalStorage persistence with timestamp delta tracking across page refreshes
 * - Web Audio API synthesized audio alerts (zero external dependencies)
 * - Web Audio API real-time ambient noise generator (Rain, White, Brown, 40Hz Focus)
 * - Dynamic SVG circular progress ring and document title sync
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. State & Constants Configuration
       ========================================================================== */
    const STORAGE_KEY = 'mindanchor_pomodoro_state_v1';
    const CIRCUMFERENCE = 2 * Math.PI * 125; // 785.398px stroke length

    // Default Application State
    let state = {
        mode: 'work', // 'work' | 'break' | 'longbreak'
        timeRemaining: 25 * 60,
        isRunning: false,
        lastUpdated: Date.now(),
        currentTask: '',
        settings: {
            workDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15,
            autoStartBreaks: false,
            autoStartWork: false,
            volume: 0.8
        },
        stats: {
            completedSessions: 0,
            totalFocusMinutes: 0,
            lastActiveDate: new Date().toDateString(),
            streakDays: 1
        }
    };

    // Timer Control Handle
    let timerInterval = null;

    // Web Audio Context & Ambient Generators
    let audioCtx = null;
    let ambientSourceNode = null;
    let ambientGainNode = null;
    let currentAmbientSound = 'off';

    /* ==========================================================================
       2. DOM Element Selectors
       ========================================================================== */
    const bodyEl = document.body;
    const timerDisplayEl = document.getElementById('timer-display');
    const timerLabelEl = document.getElementById('timer-label');
    const progressBarEl = document.getElementById('progress-bar');
    const sessionTargetEl = document.getElementById('session-target');

    const btnToggle = document.getElementById('btn-toggle');
    const toggleText = document.getElementById('toggle-text');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const btnReset = document.getElementById('btn-reset');
    const btnSkip = document.getElementById('btn-skip');

    const tabWork = document.getElementById('tab-work');
    const tabBreak = document.getElementById('tab-break');
    const tabLongBreak = document.getElementById('tab-longbreak');
    const modeTabs = [tabWork, tabBreak, tabLongBreak];

    const currentTaskInput = document.getElementById('current-task-input');

    const statSessionsEl = document.getElementById('stat-sessions');
    const statMinutesEl = document.getElementById('stat-minutes');
    const statStreakEl = document.getElementById('stat-streak');

    // Modals & Panels
    const btnAmbient = document.getElementById('btn-ambient');
    const ambientPanel = document.getElementById('ambient-panel');
    const closeAmbient = document.getElementById('close-ambient');
    const soundChips = document.querySelectorAll('.sound-chip');
    const ambientVolumeSlider = document.getElementById('ambient-volume');

    const btnSettings = document.getElementById('btn-settings');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const btnTestAudio = document.getElementById('btn-test-audio');

    const settingWorkInput = document.getElementById('setting-work');
    const settingBreakInput = document.getElementById('setting-break');
    const settingLongBreakInput = document.getElementById('setting-longbreak');
    const settingAutoBreakCheck = document.getElementById('setting-auto-break');
    const settingAutoWorkCheck = document.getElementById('setting-auto-work');
    const settingVolumeSlider = document.getElementById('setting-volume');

    /* ==========================================================================
       3. Initialization & Persistence
       ========================================================================== */
    function init() {
        loadStateFromStorage();
        setupSVGProgressRing();
        bindEvents();
        updateUI();

        // If timer was running prior to refresh, calculate offline elapsed seconds
        if (state.isRunning) {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - state.lastUpdated) / 1000);

            if (elapsedSeconds >= state.timeRemaining) {
                // Expired while offline/refreshed
                state.timeRemaining = 0;
                state.isRunning = false;
                onTimerComplete();
            } else {
                state.timeRemaining -= elapsedSeconds;
                startTimer();
            }
        }
    }

    function setupSVGProgressRing() {
        if (progressBarEl) {
            progressBarEl.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
            progressBarEl.style.strokeDashoffset = '0';
        }
    }

    function loadStateFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };

                // Check day streak logic
                const today = new Date().toDateString();
                if (state.stats.lastActiveDate !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (state.stats.lastActiveDate === yesterday.toDateString()) {
                        // Consecutive day
                    } else {
                        // Reset streak if missed more than a day
                        state.stats.streakDays = 1;
                    }
                    state.stats.lastActiveDate = today;
                }
            }
        } catch (err) {
            console.warn('MindAnchor: Failed to read from localStorage:', err);
        }
    }

    function saveStateToStorage() {
        try {
            state.lastUpdated = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (err) {
            console.warn('MindAnchor: Failed to save to localStorage:', err);
        }
    }

    /* ==========================================================================
       4. Core Timer Engine & Interval Management
       ========================================================================== */
    /**
     * Safely starts the timer interval.
     * STRICT CHECK: Ensures any existing interval is cleared before creating a new one.
     */
    function startTimer() {
        stopTimerInterval(); // Clear any existing interval to prevent overlapping timers!

        state.isRunning = true;
        updateControlsUI();
        saveStateToStorage();

        timerInterval = setInterval(() => {
            if (state.timeRemaining > 0) {
                state.timeRemaining--;
                updateClockDisplay();
                updateProgressRing();
                saveStateToStorage();
            } else {
                stopTimerInterval();
                state.isRunning = false;
                onTimerComplete();
            }
        }, 1000);
    }

    /**
     * Stops the active timer interval and nullifies the reference.
     */
    function pauseTimer() {
        stopTimerInterval();
        state.isRunning = false;
        updateControlsUI();
        saveStateToStorage();
    }

    /**
     * Clears timer interval safely.
     */
    function stopTimerInterval() {
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    /**
     * Resets timer to current mode's duration.
     */
    function resetTimer() {
        pauseTimer();
        state.timeRemaining = getModeDurationSeconds(state.mode);
        updateClockDisplay();
        updateProgressRing();
        saveStateToStorage();
    }

    /**
     * Triggered when timer reaches 00:00.
     */
    function onTimerComplete() {
        updateClockDisplay();
        updateProgressRing();
        playNotificationSound();

        // Update Stats if it was a work session
        if (state.mode === 'work') {
            state.stats.completedSessions++;
            state.stats.totalFocusMinutes += state.settings.workDuration;
            saveStateToStorage();
            updateStatsUI();
        }

        // Auto-advance mode logic
        if (state.mode === 'work') {
            const nextMode = (state.stats.completedSessions % 4 === 0) ? 'longbreak' : 'break';
            switchMode(nextMode);
            if (state.settings.autoStartBreaks) {
                startTimer();
            }
        } else {
            switchMode('work');
            if (state.settings.autoStartWork) {
                startTimer();
            }
        }
    }

    function getModeDurationSeconds(mode) {
        switch (mode) {
            case 'work': return state.settings.workDuration * 60;
            case 'break': return state.settings.breakDuration * 60;
            case 'longbreak': return state.settings.longBreakDuration * 60;
            default: return 25 * 60;
        }
    }

    function switchMode(newMode) {
        pauseTimer();
        state.mode = newMode;
        state.timeRemaining = getModeDurationSeconds(newMode);

        updateThemeBackground();
        updateTabsUI();
        updateClockDisplay();
        updateProgressRing();
        saveStateToStorage();
    }

    /* ==========================================================================
       5. UI Render Helpers
       ========================================================================== */
    function updateUI() {
        updateThemeBackground();
        updateTabsUI();
        updateClockDisplay();
        updateProgressRing();
        updateControlsUI();
        updateStatsUI();
        updateSettingsFormInputs();

        if (currentTaskInput && state.currentTask) {
            currentTaskInput.value = state.currentTask;
        }
    }

    function updateThemeBackground() {
        bodyEl.className = `mode-${state.mode}`;
    }

    function updateTabsUI() {
        modeTabs.forEach(tab => {
            if (!tab) return;
            const isTarget = tab.dataset.mode === state.mode;
            tab.classList.toggle('active', isTarget);
            tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        if (timerLabelEl) {
            if (state.mode === 'work') timerLabelEl.textContent = 'Focus Session';
            else if (state.mode === 'break') timerLabelEl.textContent = 'Short Break';
            else if (state.mode === 'longbreak') timerLabelEl.textContent = 'Long Break';
        }

        if (sessionTargetEl) {
            if (state.mode === 'work') sessionTargetEl.textContent = 'Anchor: Stay in the flow';
            else sessionTargetEl.textContent = 'Rest & Recharge';
        }
    }

    function updateClockDisplay() {
        const minutes = Math.floor(state.timeRemaining / 60);
        const seconds = state.timeRemaining % 60;
        const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (timerDisplayEl) {
            timerDisplayEl.textContent = formatted;
        }

        // Sync Page Title
        const modeTitle = state.mode === 'work' ? 'Focus' : 'Break';
        document.title = `(${formatted}) ${modeTitle} — MindAnchor`;
    }

    function updateProgressRing() {
        if (!progressBarEl) return;
        const totalSeconds = getModeDurationSeconds(state.mode);
        const progressRatio = state.timeRemaining / totalSeconds;
        const offset = CIRCUMFERENCE * (1 - progressRatio);
        progressBarEl.style.strokeDashoffset = offset;
    }

    function updateControlsUI() {
        if (state.isRunning) {
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
            toggleText.textContent = 'PAUSE';
            btnToggle.setAttribute('aria-label', 'Pause Timer');
        } else {
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
            toggleText.textContent = 'START';
            btnToggle.setAttribute('aria-label', 'Start Timer');
        }
    }

    function updateStatsUI() {
        if (statSessionsEl) statSessionsEl.textContent = state.stats.completedSessions;
        if (statMinutesEl) statMinutesEl.textContent = state.stats.totalFocusMinutes;
        if (statStreakEl) statStreakEl.textContent = state.stats.streakDays;
    }

    function updateSettingsFormInputs() {
        if (settingWorkInput) settingWorkInput.value = state.settings.workDuration;
        if (settingBreakInput) settingBreakInput.value = state.settings.breakDuration;
        if (settingLongBreakInput) settingLongBreakInput.value = state.settings.longBreakDuration;
        if (settingAutoBreakCheck) settingAutoBreakCheck.checked = state.settings.autoStartBreaks;
        if (settingAutoWorkCheck) settingAutoWorkCheck.checked = state.settings.autoStartWork;
        if (settingVolumeSlider) settingVolumeSlider.value = state.settings.volume;
    }

    /* ==========================================================================
       6. Synthesized Audio Engine (Web Audio API)
       ========================================================================== */
    function getAudioContext() {
        if (!audioCtx) {
            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioCtxClass();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    /**
     * Plays a pleasant dual-tone chime (E5 -> B5 harmonic bell)
     */
    function playNotificationSound() {
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const volume = state.settings.volume;

            if (volume <= 0) return;

            // Primary Chime Tone 1 (E5 - 659.25 Hz)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(659.25, now);
            gain1.gain.setValueAtTime(volume * 0.4, now);
            gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 1.2);

            // Harmonizing Secondary Chime Tone 2 (B5 - 987.77 Hz delayed by 180ms)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(987.77, now + 0.18);
            gain2.gain.setValueAtTime(volume * 0.5, now + 0.18);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.18);
            osc2.stop(now + 1.6);

        } catch (err) {
            console.warn('MindAnchor: Could not play audio alert:', err);
        }
    }

    /* ==========================================================================
       7. Offline Ambient Sound Generator (Web Audio API Noise Synth)
       ========================================================================== */
    function setAmbientSound(type) {
        currentAmbientSound = type;
        stopAmbientSound();

        if (type === 'off') return;

        try {
            const ctx = getAudioContext();
            const bufferSize = 2 * ctx.sampleRate;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            ambientGainNode = ctx.createGain();
            const vol = parseFloat(ambientVolumeSlider.value || 0.3);
            ambientGainNode.gain.setValueAtTime(vol * 0.2, ctx.currentTime);

            if (type === 'white') {
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                ambientSourceNode = ctx.createBufferSource();
                ambientSourceNode.buffer = buffer;
                ambientSourceNode.loop = true;
                ambientSourceNode.connect(ambientGainNode);

            } else if (type === 'brown' || type === 'rain') {
                // Brown noise algorithm
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    data[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.5; // Boost gain
                }
                ambientSourceNode = ctx.createBufferSource();
                ambientSourceNode.buffer = buffer;
                ambientSourceNode.loop = true;

                if (type === 'rain') {
                    // Lowpass filter to emulate rain patter
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(800, ctx.currentTime);
                    ambientSourceNode.connect(filter);
                    filter.connect(ambientGainNode);
                } else {
                    ambientSourceNode.connect(ambientGainNode);
                }

            } else if (type === 'binaural') {
                // 40Hz Isochronic carrier tone (220Hz modulated at 40Hz)
                const carrier = ctx.createOscillator();
                const modulator = ctx.createOscillator();
                const modGain = ctx.createGain();

                carrier.type = 'sine';
                carrier.frequency.value = 220; // A3

                modulator.type = 'sine';
                modulator.frequency.value = 40; // 40Hz Gamma Focus Frequency
                modGain.gain.value = 0.3;

                modulator.connect(modGain.gain);
                carrier.connect(ambientGainNode);

                carrier.start();
                modulator.start();

                ambientSourceNode = carrier; // Reference for stopping
            }

            ambientGainNode.connect(ctx.destination);
            if (type !== 'binaural' && ambientSourceNode) {
                ambientSourceNode.start();
            }

        } catch (err) {
            console.warn('MindAnchor: Error starting ambient noise synth:', err);
        }
    }

    function stopAmbientSound() {
        if (ambientSourceNode) {
            try {
                ambientSourceNode.stop();
                ambientSourceNode.disconnect();
            } catch (e) { }
            ambientSourceNode = null;
        }
    }

    /* ==========================================================================
       8. Event Listeners & Binding
       ========================================================================== */
    function bindEvents() {
        // Primary Controls
        btnToggle.addEventListener('click', () => {
            getAudioContext(); // Resume Web Audio on user gesture
            if (state.isRunning) pauseTimer();
            else startTimer();
        });

        btnReset.addEventListener('click', () => {
            getAudioContext();
            resetTimer();
        });

        btnSkip.addEventListener('click', () => {
            getAudioContext();
            if (state.mode === 'work') switchMode('break');
            else if (state.mode === 'break') switchMode('longbreak');
            else switchMode('work');
        });

        // Mode Tabs
        modeTabs.forEach(tab => {
            if (!tab) return;
            tab.addEventListener('click', (e) => {
                getAudioContext();
                const targetMode = e.currentTarget.dataset.mode;
                if (targetMode !== state.mode) {
                    switchMode(targetMode);
                }
            });
        });

        // Current Task Input
        currentTaskInput.addEventListener('input', (e) => {
            state.currentTask = e.target.value;
            saveStateToStorage();
        });

        // Ambient Panel Toggle
        btnAmbient.addEventListener('click', () => {
            ambientPanel.classList.toggle('hidden');
            ambientPanel.setAttribute('aria-hidden', ambientPanel.classList.contains('hidden'));
        });

        closeAmbient.addEventListener('click', () => {
            ambientPanel.classList.add('hidden');
            ambientPanel.setAttribute('aria-hidden', 'true');
        });

        soundChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                getAudioContext();
                soundChips.forEach(c => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const soundType = e.currentTarget.dataset.sound;
                setAmbientSound(soundType);
            });
        });

        ambientVolumeSlider.addEventListener('input', (e) => {
            if (ambientGainNode && audioCtx) {
                const val = parseFloat(e.target.value);
                ambientGainNode.gain.setValueAtTime(val * 0.2, audioCtx.currentTime);
            }
        });

        // Settings Modal
        btnSettings.addEventListener('click', () => {
            updateSettingsFormInputs();
            settingsModal.classList.remove('hidden');
            settingsModal.setAttribute('aria-hidden', 'false');
        });

        closeSettings.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
            settingsModal.setAttribute('aria-hidden', 'true');
        });

        btnTestAudio.addEventListener('click', () => {
            playNotificationSound();
        });

        btnSaveSettings.addEventListener('click', () => {
            const workVal = parseInt(settingWorkInput.value, 10) || 25;
            const breakVal = parseInt(settingBreakInput.value, 10) || 5;
            const longBreakVal = parseInt(settingLongBreakInput.value, 10) || 15;

            state.settings.workDuration = Math.max(1, Math.min(120, workVal));
            state.settings.breakDuration = Math.max(1, Math.min(60, breakVal));
            state.settings.longBreakDuration = Math.max(1, Math.min(60, longBreakVal));
            state.settings.autoStartBreaks = settingAutoBreakCheck.checked;
            state.settings.autoStartWork = settingAutoWorkCheck.checked;
            state.settings.volume = parseFloat(settingVolumeSlider.value);

            // If timer is not currently running, update the duration for current mode
            if (!state.isRunning) {
                state.timeRemaining = getModeDurationSeconds(state.mode);
                updateClockDisplay();
                updateProgressRing();
            }

            saveStateToStorage();
            settingsModal.classList.add('hidden');
            settingsModal.setAttribute('aria-hidden', 'true');
        });

        // Close Modals on Outer Click
        window.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
                settingsModal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Launch Application
    init();
});