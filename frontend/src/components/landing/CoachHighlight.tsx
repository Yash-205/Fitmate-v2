import React from 'react';

interface CoachHighlightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const CoachHighlight: React.FC<CoachHighlightProps> = ({ icon, title, description }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
      {icon}
    </div>
    <div>
      <div className="font-bold text-slate-800 tracking-tight">{title}</div>
      <div className="text-sm text-slate-400 font-medium">{description}</div>
    </div>
  </div>
);
