import React, { useState, useEffect, useRef } from 'react';
import { useTimer } from '../context/TimerContext';
import { 
  X, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Flame, 
  Music, 
  Waves, 
  Brain, 
  SlidersHorizontal 
} from 'lucide-react';

export default function AmbientPanel({ isOpen, onClose }) {
  const { theme } = useTimer();
  const isLight = theme === 'Dawn Glow';

  // Sound tracks state: enabled & volume (0.0 to 1.0)
  const [tracks, setTracks] = useState({
    rain: { enabled: false, volume: 0.5, name: 'Rain', icon: CloudRain },
    lofi: { enabled: false, volume: 0.5, name: 'Lo-Fi Beats', icon: Music },
    fireplace: { enabled: false, volume: 0.5, name: 'Fireplace', icon: Flame },
    waves: { enabled: false, volume: 0.4, name: 'Deep Waves', icon: Waves },
    binaural: { enabled: false, volume: 0.35, name: '40Hz Gamma Focus', icon: Brain },
  });

  const [masterVolume, setMasterVolume] = useState(0.8);
  const [masterMute, setMasterMute] = useState(false);

  // Audio Context & nodes ref
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const trackNodesRef = useRef({});

  // Initialize AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.setValueAtTime(masterVolume, audioCtxRef.current.currentTime);
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Master Gain update
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const vol = masterMute ? 0 : masterVolume;
      masterGainRef.current.gain.setTargetAtTime(vol, audioCtxRef.current.currentTime, 0.05);
    }
  }, [masterVolume, masterMute]);

  // Start / Stop individual sound generators
  const updateSoundGenerator = (soundId, isEnabled, vol) => {
    const ctx = getAudioContext();
    const existing = trackNodesRef.current[soundId];

    if (!isEnabled) {
      if (existing) {
        try {
          existing.gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
          setTimeout(() => {
            if (existing.cleanup) existing.cleanup();
            delete trackNodesRef.current[soundId];
          }, 100);
        } catch (e) {}
      }
      return;
    }

    // If already running, just update volume
    if (existing) {
      existing.gainNode.gain.setTargetAtTime(vol, ctx.currentTime, 0.05);
      return;
    }

    // Create new track generator
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.connect(masterGainRef.current);

    let cleanup = () => {};

    if (soundId === 'rain') {
      // Pink/Rain Noise generator
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.2;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(1200, ctx.currentTime);

      noiseSource.connect(lowpass);
      lowpass.connect(gainNode);
      noiseSource.start();

      cleanup = () => {
        try {
          noiseSource.stop();
          noiseSource.disconnect();
          lowpass.disconnect();
          gainNode.disconnect();
        } catch (e) {}
      };
    } else if (soundId === 'fireplace') {
      // Crackle & Deep Rumble generator
      const bufferSize = 2 * ctx.sampleRate;
      const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = crackleBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // sporadic crackle spikes
        const r = Math.random();
        if (r > 0.996) {
          output[i] = (Math.random() * 2 - 1) * 0.8;
        } else {
          output[i] = (Math.random() * 2 - 1) * 0.03;
        }
      }

      const crackleSource = ctx.createBufferSource();
      crackleSource.buffer = crackleBuffer;
      crackleSource.loop = true;

      // Low rumble osc
      const rumbleOsc = ctx.createOscillator();
      rumbleOsc.type = 'triangle';
      rumbleOsc.frequency.setValueAtTime(65, ctx.currentTime);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.3, ctx.currentTime);

      rumbleOsc.connect(rumbleGain);
      rumbleGain.connect(gainNode);
      crackleSource.connect(gainNode);

      crackleSource.start();
      rumbleOsc.start();

      cleanup = () => {
        try {
          crackleSource.stop();
          rumbleOsc.stop();
          crackleSource.disconnect();
          rumbleOsc.disconnect();
          gainNode.disconnect();
        } catch (e) {}
      };
    } else if (soundId === 'waves') {
      // Ocean surf with rhythmic LFO swell
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (last + (0.02 * white)) / 1.02;
        last = output[i];
        output[i] *= 3;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);

      // LFO for surf waves
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 10s wave period
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(250, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(gainNode);

      noiseSource.start();
      lfo.start();

      cleanup = () => {
        try {
          noiseSource.stop();
          lfo.stop();
          noiseSource.disconnect();
          filter.disconnect();
          gainNode.disconnect();
        } catch (e) {}
      };
    } else if (soundId === 'lofi') {
      // Synthesized Lo-Fi chill progression (Warm electric piano chord loop)
      const chordNotes = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23], // G7
      ];

      let chordIndex = 0;
      let activeChordNodes = [];

      const playChord = () => {
        // clear previous
        activeChordNodes.forEach(n => {
          try { n.stop(); n.disconnect(); } catch (e) {}
        });
        activeChordNodes = [];

        const notes = chordNotes[chordIndex];
        chordIndex = (chordIndex + 1) % chordNotes.length;

        notes.forEach(freq => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          // Soft attack and slow decay
          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3);
          g.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 3.8);

          osc.connect(g);
          g.connect(gainNode);

          osc.start();
          osc.stop(ctx.currentTime + 4.0);
          activeChordNodes.push(osc, g);
        });
      };

      playChord();
      const interval = setInterval(playChord, 4000);

      cleanup = () => {
        clearInterval(interval);
        activeChordNodes.forEach(n => {
          try { n.stop(); n.disconnect(); } catch (e) {}
        });
        gainNode.disconnect();
      };
    } else if (soundId === 'binaural') {
      // 40Hz Gamma Focus (200Hz Left / 240Hz Right)
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);

      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.setValueAtTime(200, ctx.currentTime);
      oscR.frequency.setValueAtTime(240, ctx.currentTime);

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gainNode);

      oscL.start();
      oscR.start();

      cleanup = () => {
        try {
          oscL.stop();
          oscR.stop();
          oscL.disconnect();
          oscR.disconnect();
          merger.disconnect();
          gainNode.disconnect();
        } catch (e) {}
      };
    }

    trackNodesRef.current[soundId] = { gainNode, cleanup };
  };

  // Sync tracks with audio nodes
  useEffect(() => {
    Object.keys(tracks).forEach(soundId => {
      const { enabled, volume } = tracks[soundId];
      updateSoundGenerator(soundId, enabled, volume);
    });
  }, [tracks]);

  // Clean up all on unmount
  useEffect(() => {
    return () => {
      Object.keys(trackNodesRef.current).forEach(id => {
        if (trackNodesRef.current[id]?.cleanup) {
          trackNodesRef.current[id].cleanup();
        }
      });
      trackNodesRef.current = {};
    };
  }, []);

  const toggleTrack = (id) => {
    setTracks(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled }
    }));
  };

  const handleTrackVolume = (id, vol) => {
    setTracks(prev => ({
      ...prev,
      [id]: { ...prev[id], volume: vol }
    }));
  };

  if (!isOpen) return null;

  const hasAnyActive = Object.values(tracks).some(t => t.enabled);

  return (
    <div className={`fixed top-20 right-4 sm:right-6 z-40 w-84 sm:w-96 p-5 sm:p-6 rounded-3xl shadow-2xl border backdrop-blur-2xl animate-fadeIn ${
      isLight 
        ? 'bg-white/95 border-stone-200 text-stone-900 shadow-stone-300/40' 
        : 'bg-[#0F0F14]/95 border-stone-800 text-white shadow-black/80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white shadow-md shadow-[#FF6B00]/30">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight">Ambient Sound Mixer</h3>
            <p className="text-[10px] opacity-60 font-semibold">Mix multi-layered focus soundscapes</p>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="p-1.5 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Master Volume Control */}
      <div className={`p-3 rounded-2xl border mb-4 flex items-center justify-between gap-3 ${
        isLight ? 'bg-stone-100 border-stone-200' : 'bg-black/40 border-stone-800'
      }`}>
        <button
          onClick={() => setMasterMute(!masterMute)}
          className={`p-1.5 rounded-xl border transition-all ${
            masterMute
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : 'bg-white/10 border-white/10 text-[#FF6B00]'
          }`}
          title={masterMute ? 'Unmute Master' : 'Mute Master'}
        >
          {masterMute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="opacity-70">Master Mix</span>
            <span className="font-mono text-[#FF6B00]">
              {masterMute ? 'Muted' : `${Math.round(masterVolume * 100)}%`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            disabled={masterMute}
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            className="w-full accent-[#FF6B00] cursor-pointer h-1.5"
          />
        </div>
      </div>

      {/* Track Mixer List with Individual Sliders */}
      <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
        {Object.entries(tracks).map(([id, track]) => {
          const Icon = track.icon;
          const isActive = track.enabled;

          return (
            <div
              key={id}
              className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                isActive
                  ? 'bg-[#FF6B00]/10 border-[#FF6B00]/40'
                  : isLight
                  ? 'bg-white border-stone-200 opacity-80'
                  : 'bg-black/25 border-stone-800/80 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleTrack(id)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                      isActive
                        ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30'
                        : isLight
                        ? 'bg-stone-200 border-stone-300 text-stone-600'
                        : 'bg-stone-800 border-stone-700 text-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                  <div>
                    <span className="text-xs font-bold block">{track.name}</span>
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-[#FF6B00]' : 'opacity-50'}`}>
                      {isActive ? 'Playing' : 'Muted'}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-[11px] font-bold opacity-80">
                  {Math.round(track.volume * 100)}%
                </span>
              </div>

              {/* Individual Track Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={track.volume}
                onChange={(e) => handleTrackVolume(id, parseFloat(e.target.value))}
                className="w-full accent-[#FF6B00] cursor-pointer h-1.5"
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Status / Quick Mute All */}
      <div className="mt-4 pt-3 border-t border-stone-800/40 flex items-center justify-between text-[11px]">
        <span className="opacity-60 font-medium">
          {hasAnyActive ? 'Web Audio synth live' : 'All channels muted'}
        </span>
        {hasAnyActive && (
          <button
            onClick={() => {
              setTracks(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(k => { next[k].enabled = false; });
                return next;
              });
            }}
            className="text-[#FF6B00] font-bold hover:underline"
          >
            Mute All Tracks
          </button>
        )}
      </div>
    </div>
  );
}
