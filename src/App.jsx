import React, { useState } from 'react';
import { useTimer } from './context/TimerContext';
import BackgroundOrbs from './components/BackgroundOrbs';
import Header from './components/Header';
import WeeklyStreak from './components/WeeklyStreak';
import PomodoroTimer from './components/PomodoroTimer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AuthModal from './components/AuthModal';
import AmbientPanel from './components/AmbientPanel';
import SettingsModal from './components/SettingsModal';
import CategoryModal from './components/CategoryModal';

export default function App() {
  const { theme } = useTimer();

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [ambientPanelOpen, setAmbientPanelOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Category Modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const handleOpenAddCategory = () => {
    setCategoryToEdit(null);
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryToEdit(cat);
    setCategoryModalOpen(true);
  };

  const isLight = theme === 'Dawn Glow';

  return (
    <div className={`relative min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto transition-colors duration-500 ${
      isLight ? 'text-stone-900' : 'text-white'
    }`}>
      {/* Dynamic Background Orbs Container */}
      <BackgroundOrbs />

      {/* Header */}
      <Header
        onOpenAmbient={() => setAmbientPanelOpen(!ambientPanelOpen)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Weekly Focus Streak Component below Header */}
      <div className="w-full mt-2 mb-1">
        <WeeklyStreak />
      </div>

      {/* Main Symmetrical 50/50 Desktop Dashboard Split */}
      <main className="my-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column — The Timer */}
        <div className="w-full flex flex-col h-full">
          <PomodoroTimer />
        </div>

        {/* Right Column — The Data (Your Progress, Focus Allocation, Your Favourite Quote) */}
        <div className="w-full flex flex-col h-full">
          <AnalyticsDashboard
            onOpenAddCategory={handleOpenAddCategory}
            onOpenEditCategory={handleOpenEditCategory}
          />
        </div>
      </main>

      {/* Footer Branding & Consistency Statement */}
      <footer className="text-center py-4 text-xs font-semibold tracking-wide opacity-75">
        Consistency compounds. Anchor your attention, one session at a time.
      </footer>

      {/* Modals & Popovers */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <AmbientPanel
        isOpen={ambientPanelOpen}
        onClose={() => setAmbientPanelOpen(false)}
      />
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
}
