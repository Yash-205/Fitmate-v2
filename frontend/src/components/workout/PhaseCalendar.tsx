import type { DayPlan, MesoPhase } from '@/types/workout';

interface PhaseCalendarProps {
  schedule: DayPlan[];
  mesoPhases?: MesoPhase[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  monthOffset?: number;
  onMonthChange?: (offset: number) => void;
}

export const PhaseCalendar = ({ 
  schedule = [], 
  mesoPhases = [], 
  selectedDate, 
  onSelectDate, 
  monthOffset = 0, 
  onMonthChange 
}: PhaseCalendarProps) => {
  // Allow rendering if we have either a schedule or mesocycles
  if ((!schedule || schedule.length === 0) && (!mesoPhases || mesoPhases.length === 0)) return null;

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const baseStartStr = (mesoPhases && mesoPhases.length > 0) 
    ? mesoPhases[0].startDate 
    : (schedule && schedule.length > 0) ? schedule[0].date : today.toISOString();
    
  let baseStartDate = new Date(baseStartStr);
  if (isNaN(baseStartDate.getTime())) {
    baseStartDate = new Date();
  }
  
  const displayDate = new Date(baseStartDate);
  displayDate.setMonth(displayDate.getMonth() + monthOffset);

  const displayMonth = displayDate.getMonth();
  const displayYear = displayDate.getFullYear();
  const monthName = displayDate.toLocaleString('default', { month: 'short' });
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  
  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(new Date(displayYear, displayMonth, d));

  const PHASE_COLORS = [
    { bg: "bg-orange-100/80", text: "text-orange-900 hover:bg-orange-200" },
    { bg: "bg-sky-100/80", text: "text-sky-900 hover:bg-sky-200" },
    { bg: "bg-emerald-100/80", text: "text-emerald-900 hover:bg-emerald-200" },
    { bg: "bg-purple-100/80", text: "text-purple-900 hover:bg-purple-200" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 w-full max-w-[340px] font-sans flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="font-bold text-sm text-slate-800">{monthName} {displayYear}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onMonthChange && onMonthChange(monthOffset - 1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button onClick={() => onMonthChange && onMonthChange(monthOffset + 1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-y-2 mb-2 text-center text-xs font-semibold text-slate-400">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
      </div>
      
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center text-sm mb-4">
        {daysArray.map((dateObj, idx) => {
          if (!dateObj) return <div key={`empty-${idx}`} />;
          
          const time = dateObj.getTime();
          const isToday = time === today.getTime();
          const isSelected = selectedDate && dateObj.toDateString() === new Date(selectedDate).toDateString();
          
          let activePhaseIndex = -1;
          if (mesoPhases?.length > 0) {
            activePhaseIndex = mesoPhases.findIndex(p => 
              time >= new Date(p.startDate).setHours(0,0,0,0) && 
              time <= new Date(p.endDate).setHours(0,0,0,0)
            );
          } else {
             const scheduleStart = new Date(schedule[0].date).setHours(0,0,0,0);
             const scheduleEnd = new Date(schedule[schedule.length - 1].date).setHours(0,0,0,0);
             if (time >= scheduleStart && time <= scheduleEnd) activePhaseIndex = 0;
          }

          const hasWorkoutMap = schedule.some(s => new Date(s.date).toDateString() === dateObj.toDateString());
          
          let cellStyle = "w-8 h-8 mx-auto flex items-center justify-center rounded-md transition-all ";
          
          if (activePhaseIndex !== -1) {
             const styleLayer = PHASE_COLORS[activePhaseIndex % PHASE_COLORS.length];
             cellStyle += `${styleLayer.bg} ${styleLayer.text} `;
             if (hasWorkoutMap) cellStyle += "cursor-pointer hover:scale-110 active:scale-95 font-bold ";
             else cellStyle += "opacity-80 ";
             
             if (isSelected) {
                cellStyle += `bg-orange-500 text-white shadow-md ring-2 ring-orange-500 ring-offset-1 z-20 relative font-black `;
             }
          } else {
             cellStyle += "text-slate-400 font-light ";
          }
          
          if (isToday && !isSelected) {
             cellStyle += "bg-orange-500 text-white active:scale-95 shadow-md";
          }
          
          return (
            <div 
              key={`date-${idx}`} 
              className={cellStyle}
              onClick={() => {
                if (hasWorkoutMap) onSelectDate(isSelected ? null : dateObj.toISOString());
              }}
            >
              {dateObj.getDate()}
            </div>
          );
        })}
      </div>
      
    </div>
  );
};
