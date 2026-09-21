import React from 'react';
import { useTimer } from '../context/TimerContext';

export default function BackgroundOrbs() {
  const { theme } = useTimer();

  // 'Obsidian Static': Clean, solid dark background (#0B0B0E) with zero animations for maximum battery saving
  if (theme === 'Obsidian Static') {
    return (
      <div 
        className="fixed inset-0 pointer-events-none transition-colors duration-700 bg-[#0B0B0E]" 
        style={{ zIndex: -1 }} 
      />
    );
  }

  const isDawn = theme === 'Dawn Glow';

  return (
    <div 
      className={`fixed inset-0 overflow-hidden pointer-events-none transition-colors duration-700 ${
        isDawn ? 'bg-[#FDFBF7]' : 'bg-[#0B0B0E]'
      }`}
      style={{ zIndex: -1 }}
    >
      {/* Container with drifting orbs */}
      <div className="absolute inset-0">
        {/* Orb 1: 55vw, filter: blur(130px), deep orange (#FF6B00) or mild yellow (#FFD54F) */}
        <div 
          className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full animate-drift-1"
          style={{
            filter: 'blur(130px)',
            opacity: isDawn ? 0.4 : 0.65,
            background: isDawn
              ? 'radial-gradient(circle, #FFD54F 0%, rgba(255,213,79,0) 70%)'
              : 'radial-gradient(circle, #FF6B00 0%, rgba(255,107,0,0) 70%)'
          }}
        />

        {/* Orb 2: 50vw, filter: blur(130px), amber (#FF8C33) or soft orange (#FFB74D) */}
        <div 
          className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] rounded-full animate-drift-2"
          style={{
            filter: 'blur(130px)',
            opacity: isDawn ? 0.4 : 0.55,
            background: isDawn
              ? 'radial-gradient(circle, #FFB74D 0%, rgba(255,183,77,0) 70%)'
              : 'radial-gradient(circle, #FF8C33 0%, rgba(255,140,51,0) 70%)'
          }}
        />

        {/* Orb 3: 60vw, filter: blur(130px), dark rust (#9D4200) or warm peach (#FFCCBC) */}
        <div 
          className="absolute -bottom-[15%] left-[20%] w-[60vw] h-[60vw] rounded-full animate-drift-3"
          style={{
            filter: 'blur(130px)',
            opacity: isDawn ? 0.4 : 0.5,
            background: isDawn
              ? 'radial-gradient(circle, #FFCCBC 0%, rgba(255,204,188,0) 70%)'
              : 'radial-gradient(circle, #9D4200 0%, rgba(157,66,0,0) 70%)'
          }}
        />
      </div>
    </div>
  );
}
