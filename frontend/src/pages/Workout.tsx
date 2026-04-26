import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { WorkoutService } from '@/services/api';
import type { WorkoutPlan } from '@/types/workout';
import { DailyBreakdownSection } from '@/components/workout/DailyBreakdownSection';
import { PhaseCalendar } from '@/components/workout/PhaseCalendar';
import { PhaseSlider } from '@/components/workout/PhaseSlider';
import { StrategySection } from '@/components/profile/StrategySection';

import { FeedbackModal } from '@/components/workout/FeedbackModal';
import { Settings2 } from 'lucide-react';

/**
 * Workout Page
 * 
 * The main dashboard for learners to view and interact with their AI-generated workout plan.
 * Provides features for:
 * - Viewing current and future training phases (Mesocycles).
 * - Exploring daily workout breakdowns (Microcycles).
 * - Triggering plan evolution/adjustment based on user feedback.
 */
const Workout: React.FC = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await WorkoutService.getPlan();
      setPlan(data);
    } catch (err: any) {
      if (err?.status === 404) setPlan(null);
      else setError(err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPlan(); }, [navigate]);

  const handlePhaseChange = (index: number) => {
    setCurrentPhaseIndex(index);
    if (!plan?.mesoPhases?.[0]) return;
    const firstPhaseDate = new Date(plan.mesoPhases[0].startDate);
    const targetPhaseDate = new Date(plan.mesoPhases[index].startDate);
    const yearsDiff = targetPhaseDate.getFullYear() - firstPhaseDate.getFullYear();
    const monthsDiff = targetPhaseDate.getMonth() - firstPhaseDate.getMonth();
    setMonthOffset(yearsDiff * 12 + monthsDiff);
  };

  const handleMonthChange = (offset: number) => {
    setMonthOffset(offset);
    if (!plan?.mesoPhases) return;
    const firstPhaseDate = new Date(plan.mesoPhases[0].startDate);
    const targetMonthDate = new Date(firstPhaseDate);
    targetMonthDate.setMonth(targetMonthDate.getMonth() + offset);
    targetMonthDate.setDate(1);
    const phaseIndex = plan.mesoPhases.findIndex(p => {
      const start = new Date(p.startDate).setHours(0,0,0,0);
      const end = new Date(p.endDate).setHours(23,59,59,999);
      return targetMonthDate.getTime() >= start && targetMonthDate.getTime() <= end;
    });
    if (phaseIndex !== -1 && phaseIndex !== currentPhaseIndex) setCurrentPhaseIndex(phaseIndex);
  };

  const handleGenerateWithFeedback = async (feedback: string | null) => {
    try {
      setGenerating(true);
      setError('');
      const data = await WorkoutService.generatePlan(feedback);
      setPlan(data);
      setIsFeedbackOpen(false);
    } catch (err: any) { setError(err.message); }
    finally { setGenerating(false); }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-end px-2">
          {plan?.schedule && plan.schedule.length > 0 ? (
            <Button 
              onClick={() => setIsFeedbackOpen(true)} 
              disabled={generating} 
              className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm px-6 h-11 rounded-2xl font-bold text-xs flex items-center gap-2 group transition-all active:scale-95"
            >
              <Settings2 size={16} className="text-orange-500 group-hover:rotate-45 transition-transform duration-300" />
              Adjust Plan
            </Button>
          ) : (
             <Button 
              onClick={() => handleGenerateWithFeedback(null)} 
              disabled={generating} 
              className="bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/10 px-8 h-11 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
            >
              {generating ? 'AI In Progress...' : 'Generate Workout Plan'}
            </Button>
          )}
        </header>

        {error && <div className="mx-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold shadow-sm">{error}</div>}

        {plan && !generating && plan.schedule && (
          <div className="space-y-6">
            {/* 1. Integrated Command Center (Strategic Context) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2 items-start h-auto">
              {/* Left Sidebar: Temporal Context */}
              <div className="lg:col-span-4 self-start">
                <PhaseCalendar 
                  schedule={plan.schedule} mesoPhases={plan.mesoPhases} 
                  selectedDate={selectedDateFilter} onSelectDate={setSelectedDateFilter}
                  monthOffset={monthOffset} onMonthChange={handleMonthChange}
                />
              </div>

              {/* Main Stage: Phase & Strategy */}
              <div className="lg:col-span-8 space-y-6">
                <PhaseSlider 
                  mesoPhases={plan.mesoPhases || []} currentIndex={currentPhaseIndex} onChange={handlePhaseChange} 
                />
                <StrategySection plan={plan} hideStrategy={true} />
              </div>
            </div>

            {/* 2. Microcycle Execution (Full Width Breakdown) */}
            <div className="pt-6 border-t border-slate-200">
              <div className="bg-white/40 rounded-[2rem] p-4 lg:p-6 border border-white/60 shadow-inner backdrop-blur-sm">
                <DailyBreakdownSection 
                  plan={plan} selectedDateFilter={selectedDateFilter} setSelectedDateFilter={setSelectedDateFilter} 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        onSubmit={handleGenerateWithFeedback}
        isGenerating={generating}
      />
    </div>
  );
};

export default Workout;
