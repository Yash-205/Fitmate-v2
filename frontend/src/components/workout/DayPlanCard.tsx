import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Info, Dumbbell } from 'lucide-react';
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
      className={`flex flex-col h-[480px] transition-all duration-300 relative overflow-hidden group ${
        isToday 
          ? 'border-orange-500 ring-2 ring-orange-500/10 shadow-lg bg-white z-10' 
          : isPast 
            ? 'opacity-60 bg-slate-50 border-slate-200' 
            : 'bg-white border-slate-200 hover:border-orange-200 shadow-sm hover:shadow-md'
      }`}
    >
      {isToday && (
        <div className="absolute top-0 right-0 h-1 bg-orange-500 w-full animate-pulse z-20" />
      )}
      
      <CardHeader className={`pb-3 border-b shrink-0 p-4 ${isToday ? 'bg-orange-50/30' : 'bg-slate-50/50'}`}>
        <div className="flex justify-between items-center mb-1">
          <CardDescription className={`uppercase tracking-widest font-black text-[10px] ${isToday ? 'text-orange-600' : 'text-slate-400'}`}>
            {formattedDate} {isToday && '• Today'}
          </CardDescription>
          {day.isRestDay ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Rest
            </span>
          ) : (
             <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isToday ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
              Day {day.day.split(' ')[1]}
            </span>
          )}
        </div>
        <CardTitle className={`text-base font-bold tracking-tight ${isPast ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {day.focus}
        </CardTitle>
        
        {day.dailyObjective && !day.isRestDay && (
          <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            "{day.dailyObjective}"
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-white">
        {day.isRestDay || (day.exercises.length === 0 && !day.warmup?.length && !day.cooldown?.length) ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-emerald-50/10">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <Moon size={20} className="text-emerald-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Recovery Day</h4>
            <p className="text-xs text-slate-400 max-w-[150px]">Time for your muscles to repair and grow.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto slim-scrollbar">
            {/* Preparation Section - Condensed */}
            {day.warmup && day.warmup.length > 0 && (
              <div className="bg-slate-50/40 border-b border-slate-100/50 p-2 px-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Dumbbell size={10} className="text-orange-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Preparation</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {day.warmup.map((ex, eIdx) => (
                    <span key={`warm-${eIdx}`} className="text-[10px] bg-white border border-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {typeof ex === 'string' ? ex : `${ex.name} ${ex.sets}x${ex.reps}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Main Exercises */}
            <div className="divide-y divide-slate-100/60">
              {day.exercises.map((ex, eIdx) => (
                <div key={eIdx} className="p-3 hover:bg-slate-50/50 transition-colors group/ex">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-700 text-xs leading-tight group-hover/ex:text-orange-600 transition-colors italic">
                        {ex.name}
                      </h4>
                      {ex.intensity && (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-violet-600 font-bold bg-violet-50 px-1 rounded-sm uppercase tracking-tighter">
                            {ex.intensity}
                          </span>
                          {ex.notes && <span className="text-[9px] text-slate-400 line-clamp-1">{ex.notes}</span>}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end">
                      <span className={`text-[11px] font-black tabular-nums ${isToday ? 'text-orange-600' : 'text-slate-500'}`}>
                        {ex.sets} <span className="text-[9px] opacity-60">sets</span>
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 tabular-nums">
                        {ex.reps} <span className="text-[8px] opacity-60">reps</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cooldown Section - Condensed */}
            {day.cooldown && day.cooldown.length > 0 && (
              <div className="bg-slate-50/40 border-t border-slate-100/50 p-2 px-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Info size={10} className="text-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Post-Workout</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {day.cooldown.map((ex, eIdx) => (
                    <span key={`cool-${eIdx}`} className="text-[10px] bg-white border border-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {typeof ex === 'string' ? ex : ex.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Card Footer - Action hint or muscle icon */}
        {!day.isRestDay && (
          <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/20">
            <div className="flex items-center gap-1">
              <Dumbbell size={12} className="text-slate-300" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {day.exercises.length} Exercises
              </span>
            </div>
            <button className="text-[9px] font-bold text-orange-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
              Start Session
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
