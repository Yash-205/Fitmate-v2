import React from 'react';
import { Button } from "@/components/ui/button";
import { DayPlanCard } from './DayPlanCard';
import type { WorkoutPlan } from '@/types/workout';

interface DailyBreakdownSectionProps {
  plan: WorkoutPlan;
  selectedDateFilter: string | null;
  setSelectedDateFilter: (date: string | null) => void;
}

export const DailyBreakdownSection: React.FC<DailyBreakdownSectionProps> = ({
  plan,
  selectedDateFilter,
  setSelectedDateFilter
}) => {
  const filteredSchedule = plan.schedule.filter(day => {
    if (!selectedDateFilter) return true;
    return new Date(day.date).toDateString() === new Date(selectedDateFilter).toDateString();
  }) || [];

  const trainingDays = plan.schedule.filter(d => !d.isRestDay).length;
  const restDays = plan.schedule.filter(d => d.isRestDay).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {selectedDateFilter 
              ? `Schedule for ${new Date(selectedDateFilter).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}` 
              : 'Weekly Microcycle'}
          </h2>
          {!selectedDateFilter && (
            <p className="text-xs text-slate-400 mt-1">
              {trainingDays} training days • {restDays} rest days
            </p>
          )}
        </div>
        
        {selectedDateFilter && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedDateFilter(null)}
            className="text-xs text-slate-500 hover:text-slate-900 border-dashed"
          >
            Clear Filter
          </Button>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSchedule.map((day, dIdx) => (
          <DayPlanCard key={dIdx} day={day} />
        ))}
      </div>
    </div>
  );
};
