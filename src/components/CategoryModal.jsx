import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { X, Target, Plus, Save, Palette } from 'lucide-react';

export default function CategoryModal({ isOpen, onClose, categoryToEdit }) {
  const { theme, addCategory, updateCategory } = useTimer();

  const [name, setName] = useState('');
  const [goalHours, setGoalHours] = useState('20');
  const [color, setColor] = useState('#FF6B00');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setGoalHours(categoryToEdit.goalHours.toString());
      setColor(categoryToEdit.color || '#FF6B00');
    } else {
      setName('');
      setGoalHours('20');
      setColor('#FF6B00');
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const isLight = theme === 'Dawn Glow';

  const colorPresets = ['#FF6B00', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, {
        name,
        goalHours: parseFloat(goalHours) || 10,
        color
      });
    } else {
      addCategory({
        name,
        goalHours: parseFloat(goalHours) || 10,
        color
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border transition-all ${
        isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-[#0F0F14] border-stone-800 text-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black tracking-tight">
              {categoryToEdit ? 'Edit Focus Goal' : 'Add New Focus Goal'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-stone-500/20 text-stone-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Category Name</label>
            <input
              type="text"
              required
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Research, Machine Learning"
              className={`p-3 rounded-xl border text-xs font-bold outline-none ${
                isLight ? 'bg-stone-100 border-stone-300' : 'bg-black/40 border-stone-800 focus:border-[#FF6B00]'
              }`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Weekly Goal (Hours)</label>
            <input
              type="number"
              required
              min="0.5"
              step="0.5"
              max="168"
              value={goalHours}
              onChange={(e) => setGoalHours(e.target.value)}
              placeholder="40"
              className={`p-3 rounded-xl border text-xs font-mono font-bold outline-none ${
                isLight ? 'bg-stone-100 border-stone-300' : 'bg-black/40 border-stone-800 focus:border-[#FF6B00]'
              }`}
            />
          </div>

          {/* Color Picker Presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Accent Color</span>
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-orange w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-3"
          >
            {categoryToEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{categoryToEdit ? 'Save Goal' : 'Create Goal'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
