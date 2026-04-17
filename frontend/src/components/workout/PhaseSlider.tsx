import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { MesoPhase } from '@/types/workout';

interface PhaseSliderProps {
  mesoPhases: MesoPhase[];
  currentIndex: number;
  onChange: (index: number) => void;
}

const PHASE_COLORS = [
  { bg: 'bg-orange-600', shadow: 'shadow-orange-500/20' },
  { bg: 'bg-sky-600', shadow: 'shadow-sky-500/20' },
  { bg: 'bg-emerald-600', shadow: 'shadow-emerald-500/20' },
  { bg: 'bg-purple-600', shadow: 'shadow-purple-500/20' },
];

export const PhaseSlider: React.FC<PhaseSliderProps> = ({ mesoPhases, currentIndex, onChange }) => {
  if (!mesoPhases || mesoPhases.length === 0) return null;

  const phase = mesoPhases[currentIndex];
  const c = PHASE_COLORS[currentIndex % PHASE_COLORS.length];
  
  const startStr = new Date(phase.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endStr = new Date(phase.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Minimal Slider - Mirroring Calendar Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">Phase {currentIndex + 1} of {mesoPhases.length}</span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Current Active</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => currentIndex > 0 && onChange(currentIndex - 1)}
            disabled={currentIndex === 0}
            className={`p-1 hover:bg-slate-100 rounded-md transition-colors ${currentIndex === 0 ? 'text-slate-200' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <FaChevronLeft size={16} />
          </button>
          <button 
            onClick={() => currentIndex < mesoPhases.length - 1 && onChange(currentIndex + 1)}
            disabled={currentIndex === mesoPhases.length - 1}
            className={`p-1 hover:bg-slate-100 rounded-md transition-colors ${currentIndex === mesoPhases.length - 1 ? 'text-slate-200' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <FaChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Original Vivid Phase Card */}
      <div className={`${c.bg} text-white rounded-3xl p-8 shadow-xl ${c.shadow} relative overflow-hidden transition-all duration-500 min-h-[220px] flex flex-col justify-center`}>
        {/* Abstract background number */}
        <div className="absolute right-0 top-0 opacity-10 text-[12rem] leading-none font-black -mt-10 -mr-6 pointer-events-none select-none">
          {String(currentIndex + 1).padStart(2, '0')}
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-4xl font-black tracking-tight leading-none">{phase.name}</h3>
            <div className="flex items-center gap-2 opacity-80 text-xs font-bold uppercase tracking-widest pt-1">
              <span>{phase.durationWeeks} Weeks</span>
              <span className="size-1 bg-white/40 rounded-full" />
              <span>{startStr} — {endStr}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 block">Primary Goal</span>
              <p className="text-base font-bold leading-relaxed">{phase.goal}</p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 block">Phase Focus</span>
              <p className="text-sm font-semibold opacity-80 leading-relaxed">{phase.focus}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
