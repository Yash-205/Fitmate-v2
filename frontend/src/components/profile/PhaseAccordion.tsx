import React from 'react';
import { Target, ClipboardList } from 'lucide-react';
import type { MesoPhase } from '@/types/workout';

interface PhaseAccordionProps {
  mesoPhases: MesoPhase[];
  expandedPhase: number;
  setExpandedPhase: (idx: number) => void;
}

const PHASE_COLORS = [
  { bg: 'bg-orange-600', shadow: 'shadow-orange-500/20', badge: 'bg-orange-50 text-orange-700' },
  { bg: 'bg-sky-600', shadow: 'shadow-sky-500/20', badge: 'bg-sky-50 text-sky-700' },
  { bg: 'bg-emerald-600', shadow: 'shadow-emerald-500/20', badge: 'bg-emerald-50 text-emerald-700' },
  { bg: 'bg-purple-600', shadow: 'shadow-purple-500/20', badge: 'bg-purple-50 text-purple-700' },
];

export const PhaseAccordion: React.FC<PhaseAccordionProps> = ({ mesoPhases, expandedPhase, setExpandedPhase }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Mesocycle Phases</h2>
        </div>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{mesoPhases?.length || 0} phases</span>
      </div>

      <div className="space-y-3">
        {mesoPhases?.map((phase: MesoPhase, idx: number) => {
          const c = PHASE_COLORS[idx % PHASE_COLORS.length];
          const isActive = idx === expandedPhase;
          const startStr = new Date(phase.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const endStr = new Date(phase.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

          if (isActive) {
            return (
              <div
                key={idx}
                className={`${c.bg} text-white rounded-2xl p-6 shadow-lg ${c.shadow} relative overflow-hidden cursor-pointer transition-all duration-300`}
                onClick={() => setExpandedPhase(idx)}
              >
                <div className="absolute right-0 top-0 opacity-10 text-[7rem] leading-none font-black -mt-3 -mr-3 pointer-events-none">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                      {idx === 0 ? 'Active Phase' : `Phase ${idx + 1}`}
                    </span>
                    <span className="text-[10px] font-mono opacity-70">
                      {phase.durationWeeks}W • {startStr} → {endStr}
                    </span>
                  </div>
                  <h3 className="font-black text-2xl tracking-tight mb-3">{phase.name}</h3>
                  <div className="space-y-2 animate-[fadeIn_0.3s_ease-out]">
                    <p className="text-sm opacity-90 font-medium flex items-start gap-2">
                      <Target size={14} className="mt-0.5 opacity-80" /> {phase.goal}
                    </p>
                    <p className="text-xs opacity-70 font-medium flex items-start gap-2">
                      <ClipboardList size={14} className="mt-0.5 opacity-80" /> {phase.focus}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => setExpandedPhase(idx)}
              className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl p-4 transition-all duration-200 flex items-center gap-4"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-200/70 flex items-center justify-center font-black text-xs text-slate-500 flex-shrink-0">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-700 text-sm truncate">{phase.name}</h3>
                  {idx === 0 && (
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded flex-shrink-0">Active</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {phase.durationWeeks}W • {startStr} → {endStr}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 flex-shrink-0"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};
