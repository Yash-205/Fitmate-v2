import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AthleteProfileCardProps {
  profile: any;
}

export const AthleteProfileCard: React.FC<AthleteProfileCardProps> = ({ profile }) => {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden !p-0 !gap-0">
      <CardHeader className="bg-slate-900 text-white !px-5 !py-4 !rounded-none">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-orange-400">●</span> Athlete Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="!px-5 !py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Weight</p>
            <p className="text-xl font-black text-slate-800">{profile?.weight}<span className="text-xs font-normal text-slate-400 ml-1">kg</span></p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Height</p>
            <p className="text-xl font-black text-slate-800">{profile?.height}<span className="text-xs font-normal text-slate-400 ml-1">cm</span></p>
          </div>
        </div>

        <div className="space-y-0">
          {[
            { k: 'Age / Gender', v: `${profile?.age}y / ${profile?.gender}` },
            { k: 'Training Age', v: profile?.trainingExperience },
            { k: 'Availability', v: `${profile?.availableDays} days/week` },
            { k: 'Stress / Sleep', v: `${profile?.stressLevel} / ${profile?.sleepQuality}` },
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500 font-medium">{row.k}</span>
              <span className="text-sm font-bold text-slate-700">{row.v}</span>
            </div>
          ))}
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
          <p className="text-[9px] font-bold text-orange-600 uppercase tracking-wider mb-1">Primary Objective</p>
          <p className="text-sm font-semibold text-slate-800 leading-snug">{profile?.goal}</p>
        </div>
      </CardContent>
    </Card>
  );
};
