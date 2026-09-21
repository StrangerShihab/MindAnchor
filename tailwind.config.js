/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ember: {
          bg: '#0B0B0E',
          orange: '#FF6B00',
          amber: '#FF8C33',
          rust: '#9D4200',
          card: 'rgba(20, 20, 25, 0.6)',
          border: 'rgba(255, 107, 0, 0.15)',
        },
        dawn: {
          bg: '#FDFBF7',
          yellow: '#FFD54F',
          orange: '#FFB74D',
          peach: '#FFCCBC',
          card: 'rgba(255, 255, 255, 0.65)',
          border: 'rgba(255, 107, 0, 0.2)',
          text: '#1C1917',
          subtext: '#57534E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 4px 24px rgba(255, 107, 0, 0.4)',
        'glow-orange-lg': '0 8px 32px rgba(255, 107, 0, 0.5)',
        'glass-dark': '0 20px 40px rgba(0, 0, 0, 0.4)',
        'glass-light': '0 20px 40px rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        drift1: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(10vw, 8vh) scale(1.15)' },
          '66%': { transform: 'translate(-5vw, 15vh) scale(0.9)' },
          '100%': { transform: 'translate(8vw, -5vh) scale(1.08)' },
        },
        drift2: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-12vw, -10vh) scale(0.88)' },
          '66%': { transform: 'translate(8vw, -12vh) scale(1.12)' },
          '100%': { transform: 'translate(-6vw, 10vh) scale(0.95)' },
        },
        drift3: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(15vw, -8vh) scale(1.08)' },
          '66%': { transform: 'translate(-10vw, 6vh) scale(0.92)' },
          '100%': { transform: 'translate(5vw, 12vh) scale(1.1)' },
        },
        breathing: {
          '0%, 100%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.02) translate(0.5%, 0.5%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        }
      },
      animation: {
        'drift-1': 'drift1 24s ease-in-out infinite alternate',
        'drift-2': 'drift2 28s ease-in-out infinite alternate',
        'drift-3': 'drift3 22s ease-in-out infinite alternate',
        'breathing': 'breathing 16s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
