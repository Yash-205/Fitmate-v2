import React from 'react';
import type { WorkoutPlan } from '@/types/workout';

interface StrategySectionProps {
  plan: WorkoutPlan;
  hideStrategy?: boolean;
}

export const StrategySection: React.FC<StrategySectionProps> = ({ plan, hideStrategy = false }) => {
  return (
    <>
      {!hideStrategy && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Overarching Strategy</h2>
          </div>
          <p className="text-slate-700 leading-[1.8] text-[15px] font-medium">
            {plan.overarchingStrategy}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 5-5-5-5"/><path d="M18 17 18 12 18 7"/><path d="m6 17 5-5-5-5"/></svg>
            </div>
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-[0.12em]">Progression Rule</p>
          </div>
          <p className="text-sm text-slate-700 font-bold leading-relaxed">{plan.progressionRule}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 10 22 4 16 4"/></svg>
            </div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.12em]">Deload Strategy</p>
          </div>
          <p className="text-sm text-slate-700 font-bold leading-relaxed">{plan.deloadStrategy}</p>
        </div>
      </div>
    </>
  );
};
