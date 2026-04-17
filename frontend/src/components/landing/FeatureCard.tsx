import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 group">
    <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="text-xl font-black mb-4 text-slate-800 tracking-tight">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed text-sm">{description}</p>
  </div>
);
