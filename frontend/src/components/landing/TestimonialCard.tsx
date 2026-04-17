import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  initials: string;
  name: string;
  role: string;
  quote: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ initials, name, role, quote }) => (
  <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-slate-100/30 transition-all duration-500 flex flex-col justify-between">
    <div className="space-y-6">
      <div className="flex gap-1 text-orange-500">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
      </div>
      <p className="text-slate-600 font-medium italic leading-relaxed">"{quote}"</p>
    </div>
    <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-50">
      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-black text-sm border-2 border-white shadow-sm">
        {initials}
      </div>
      <div>
        <div className="font-bold text-slate-900 tracking-tight">{name}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{role}</div>
      </div>
    </div>
  </div>
);
