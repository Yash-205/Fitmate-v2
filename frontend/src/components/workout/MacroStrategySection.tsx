import React, { useState, useEffect } from 'react';
import type { WorkoutPlan } from '@/types/workout';
import { PhaseCalendar } from './PhaseCalendar';

import { Target } from 'lucide-react';

interface MacroStrategySectionProps {
  plan: WorkoutPlan;
  selectedDateFilter: string | null;
  onSelectDateFilter: (date: string | null) => void;
}

export const MacroStrategySection: React.FC<MacroStrategySectionProps> = ({
  plan,
  selectedDateFilter,
  onSelectDateFilter
}) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    setActivePhaseIndex(0);
    setMonthOffset(0);
  }, [plan]);

  const syncCalendarToPhase = (idx: number, loadedPlan: WorkoutPlan) => {
    if (!loadedPlan.mesoPhases || !loadedPlan.mesoPhases[idx]) return;
    const phase = loadedPlan.mesoPhases[idx];
    
    const baseDateStr = (loadedPlan.mesoPhases && loadedPlan.mesoPhases.length > 0)
      ? loadedPlan.mesoPhases[0].startDate
      : (loadedPlan.schedule && loadedPlan.schedule.length > 0) ? loadedPlan.schedule[0].date : new Date().toISOString();
    
    const baseDate = new Date(baseDateStr);
    const targetDate = new Date(phase.startDate);
    const diffMonths = (targetDate.getFullYear() - baseDate.getFullYear()) * 12 + (targetDate.getMonth() - baseDate.getMonth());
    setMonthOffset(diffMonths);
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
      {/* Top badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-semibold tracking-wide uppercase">
          {plan.splitType}
        </span>
        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold tracking-wide uppercase">
          Goal: {plan.goal}
        </span>
        <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-xs font-semibold tracking-wide uppercase">
          {plan.experienceLevel} • {plan.weeklyFrequency}x/week
        </span>
        {plan.schedule && plan.schedule.length > 0 && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold tracking-wide uppercase">
            Completed: {plan.completedDays} / {plan.schedule.length} Days
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start pt-4">
        {/* Left Side: Strategic Details */}
        <div className="flex-1 flex flex-col gap-8">
          {/* 1. Overarching Strategy */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              Periodization Strategy
            </h3>
            <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100/50 shadow-inner">
              {plan.overarchingStrategy}
            </p>
          </div>
          
          {/* 2. Tactical Growth Rules (Progression & Deload) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Execution & Growth Rules
            </h3>
            
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex items-start gap-5 transition-all hover:bg-slate-50/50 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex flex-shrink-0 items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 5-5-5-5"/><path d="M18 17 18 12 18 7"/><path d="m6 17 5-5-5-5"/></svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  Progression Protocol
                </h4>
                <p className="text-sm md:text-md text-slate-800 font-bold leading-relaxed">
                  {plan.progressionRule}
                </p>
              </div>
            </div>
            
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex items-start gap-5 transition-all hover:bg-slate-50/50 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex flex-shrink-0 items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 10 22 4 16 4"/></svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                  Deload & Recovery Strategy
                </h4>
                <p className="text-sm md:text-md text-slate-800 font-bold leading-relaxed">
                  {plan.deloadStrategy}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Timeline & Phase Details */}
        <div className="flex flex-col gap-6 lg:w-[380px] w-full">
          {/* Calendar */}
          <div className="flex items-center justify-center">
            <PhaseCalendar 
              schedule={plan.schedule} 
              mesoPhases={plan.mesoPhases}
              selectedDate={selectedDateFilter}
              onSelectDate={onSelectDateFilter}
              monthOffset={monthOffset}
              onMonthChange={setMonthOffset}
            />
          </div>

          {/* Mesocycle Roadmap */}
          <div className="flex flex-col gap-4 bg-slate-50/50 p-5 rounded-[32px] border border-slate-100/50">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                 Current Phase Details
              </h3>
              
              {plan.mesoPhases && plan.mesoPhases.length > 1 && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const newIdx = Math.max(0, activePhaseIndex - 1);
                      setActivePhaseIndex(newIdx);
                      syncCalendarToPhase(newIdx, plan);
                    }}
                    disabled={activePhaseIndex === 0}
                    className="p-1.5 rounded-lg bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all border border-slate-100 shadow-sm"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <span className="text-[10px] font-bold text-slate-500 w-8 text-center">{activePhaseIndex + 1}/{plan.mesoPhases.length}</span>
                  <button 
                    onClick={() => {
                      const newIdx = Math.min(plan.mesoPhases!.length - 1, activePhaseIndex + 1);
                      setActivePhaseIndex(newIdx);
                      syncCalendarToPhase(newIdx, plan);
                    }}
                    disabled={activePhaseIndex === plan.mesoPhases.length - 1}
                    className="p-1.5 rounded-lg bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all border border-slate-100 shadow-sm"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              )}
            </div>

            {plan.mesoPhases && plan.mesoPhases.length > 0 && (() => {
              const phase = plan.mesoPhases[activePhaseIndex];
              const isCurrent = activePhaseIndex === 0; // Keeping for reference if needed, or remove if strictly warning-free
              let bgClass = "bg-orange-600 shadow-orange-500/20";
              if (activePhaseIndex === 1) bgClass = "bg-sky-600 shadow-sky-500/20";
              if (activePhaseIndex === 2) bgClass = "bg-emerald-600 shadow-emerald-500/20";
              if (activePhaseIndex === 3) bgClass = "bg-purple-600 shadow-purple-500/20";

              return (
                <div className={`${bgClass} text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[180px] transition-all duration-500 group`}>
                  <div className="absolute right-0 top-0 opacity-10 text-[7rem] leading-none font-bold -mt-3 -mr-3 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    0{activePhaseIndex + 1}
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-mono font-bold opacity-80 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md">
                        {isCurrent ? 'Active Focus' : 'Future Phase'} • {phase.durationWeeks}W
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl leading-tight tracking-tight">
                        {phase.name}
                      </h3>
                      <p className="text-sm opacity-90 mt-2 font-medium leading-relaxed flex items-center gap-1.5">
                        <Target size={14} className="text-white/80" /> {phase.goal}
                      </p>
                      <p className="text-xs opacity-75 mt-3 line-clamp-3 leading-relaxed font-medium">
                        {phase.focus}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
