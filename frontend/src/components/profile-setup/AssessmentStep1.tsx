import React from 'react';
import { Button } from "@/components/ui/button";

interface AssessmentStep1Props {
  profileData: any;
  updateField: (field: string, value: string) => void;
  onNext: () => void;
  labelClass: string;
  inputClass: string;
  selectClass: string;
}

export const AssessmentStep1: React.FC<AssessmentStep1Props> = ({ 
  profileData, updateField, onNext, labelClass, inputClass, selectClass 
}) => {
  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        <div className="grid gap-2">
          <label className={labelClass}>Age</label>
          <input className={inputClass} type="number" placeholder="Years" required min="10" max="100"
            value={profileData.age} onChange={(e) => updateField('age', e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className={labelClass}>Gender</label>
          <select className={selectClass} value={profileData.gender} onChange={(e) => updateField('gender', e.target.value)}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={labelClass}>Weight (kg)</label>
          <input className={inputClass} type="number" placeholder="Kgs" required min="30" max="300"
            value={profileData.weight} onChange={(e) => updateField('weight', e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className={labelClass}>Height (cm)</label>
          <input className={inputClass} type="number" placeholder="Cms" required min="100" max="250"
            value={profileData.height} onChange={(e) => updateField('height', e.target.value)} />
        </div>
      </div>

      <div className="grid gap-2">
        <label className={labelClass}>Goal — The Ultimate Vision</label>
        <textarea 
          className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm focus-visible:outline-none focus-visible:border-orange-500 resize-none text-slate-700 placeholder:text-slate-400"
          placeholder="e.g., I want to lose 10kg of fat and build visible muscle definition for a wedding in 6 months..."
          rows={3} required
          value={profileData.goal} onChange={(e) => updateField('goal', e.target.value)}
        />
        <p className="text-[10px] text-slate-400 mt-1">Be as specific as possible — timeline, target areas, event deadlines.</p>
      </div>

      <Button type="button" onClick={onNext} className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-500/20">
        Next — Training & Lifestyle →
      </Button>
    </>
  );
};
