import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon } from 'lucide-react';
import type { DayPlan } from '@/types/workout';

interface DayPlanCardProps {
  day: DayPlan;
}

export const DayPlanCard = ({ day }: DayPlanCardProps) => {
  const planDate = new Date(day.date);
  const today = new Date();
  
  const isToday = 
    planDate.getDate() === today.getDate() &&
    planDate.getMonth() === today.getMonth() &&
    planDate.getFullYear() === today.getFullYear();
  
  const isPast = planDate < new Date(today.setHours(0,0,0,0));

  const formattedDate = planDate.toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });

  return (
    <Card 
      className={`flex flex-col h-full transition-all duration-300 relative overflow-visible ${
        isToday 
          ? 'border-orange-500 border-2 shadow-lg shadow-orange-500/10 scale-[1.02] bg-white ring-4 ring-orange-500/10 z-10' 
          : isPast 
            ? 'opacity-60 bg-slate-50 border-slate-200' 
            : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
      }`}
    >
      {isToday && (
        <div className="absolute -top-3 -right-3 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-md z-10 animate-pulse">
          Today
        </div>
      )}
      
      <CardHeader className={`pb-4 border-b p-4 ${isToday ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50/80 border-slate-100'}`}>
        <div className="flex justify-between items-start mb-2">
          <CardDescription className={`uppercase tracking-wider font-bold text-xs ${isToday ? 'text-orange-700' : 'text-slate-500'}`}>
            {day.day} • {formattedDate}
          </CardDescription>
          {day.isRestDay && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Rest
            </span>
          )}
        </div>
        <CardTitle className={`text-base leading-tight mb-2 ${isPast ? 'line-through decoration-slate-400' : ''}`}>{day.focus}</CardTitle>
        
        {/* Daily Objective — only for training days */}
        {day.dailyObjective && (
          <div className={`rounded-md p-2 mt-2 ${isToday ? 'bg-white border border-orange-200/60 shadow-sm' : 'bg-white/60'}`}>
            <p className={`text-xs font-medium italic leading-relaxed ${isToday ? 'text-orange-900' : 'text-slate-600'}`}>
              "{day.dailyObjective}"
            </p>
          </div>
        )}


      </CardHeader>
      
      <CardContent className="p-0 flex-1 bg-white rounded-b-xl">
        {day.isRestDay || (day.exercises.length === 0 && !day.warmup?.length && !day.cooldown?.length) ? (
          <div className="p-6 text-center flex flex-col items-center justify-center h-full">
            <Moon size={24} className="mb-2 text-slate-300" />
            <span className="text-slate-400 font-medium text-sm">Recovery</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100/60">
            {/* Warmup Section */}
            {day.warmup && day.warmup.length > 0 && (
              <div className="bg-slate-50/30">
                <div className="px-3 py-1.5 border-b border-slate-100/50 flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Preparation</span>
                </div>
                {day.warmup.map((ex, eIdx) => (
                  <div key={`warm-${eIdx}`} className="p-2.5 px-3 opacity-70">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-slate-600 text-[11px] leading-tight">{ex.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 whitespace-nowrap">
                        {ex.sets}× {ex.reps}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Main Exercises */}
            <div className="bg-white">
              {day.exercises.map((ex, eIdx) => (
                <div key={eIdx} className="p-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-slate-700 text-xs leading-tight">{ex.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${isToday ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                      {ex.sets}× {ex.reps}
                    </span>
                  </div>
                  {(ex.intensity || ex.notes) && (
                    <div className="flex items-center gap-2 mt-1">
                      {ex.intensity && (
                        <span className="text-[10px] text-violet-600 font-semibold bg-violet-50 px-1.5 py-0.5 rounded">
                          {ex.intensity}
                        </span>
                      )}
                      {ex.notes && <span className="text-[10px] text-slate-400 truncate">{ex.notes}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Cooldown Section */}
            {day.cooldown && day.cooldown.length > 0 && (
              <div className="bg-slate-50/30">
                <div className="px-3 py-1.5 border-b border-slate-100/50 flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Post-Workout</span>
                </div>
                {day.cooldown.map((ex, eIdx) => (
                  <div key={`cool-${eIdx}`} className="p-2.5 px-3 opacity-70">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-slate-600 text-[11px] leading-tight">{ex.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 whitespace-nowrap">
                        {ex.sets}× {ex.reps}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
