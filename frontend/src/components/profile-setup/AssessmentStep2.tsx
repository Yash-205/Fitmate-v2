import React from 'react';
import { Button } from "@/components/ui/button";

interface AssessmentStep2Props {
  profileData: any;
  updateField: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  labelClass: string;
  selectClass: string;
}

export const AssessmentStep2: React.FC<AssessmentStep2Props> = ({ 
  profileData, updateField, onNext, onBack, labelClass, selectClass 
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className={labelClass}>Training Experience</label>
          <select className={selectClass} value={profileData.trainingExperience} onChange={(e) => updateField('trainingExperience', e.target.value)}>
            <option>Beginner (&lt;1 year)</option>
            <option>Intermediate (1-3 years)</option>
            <option>Advanced (3+ years)</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={labelClass}>Available Days / Week</label>
          <select className={selectClass} value={profileData.availableDays} onChange={(e) => updateField('availableDays', e.target.value)}>
            <option value="3">3 days</option>
            <option value="4">4 days</option>
            <option value="5">5 days</option>
            <option value="6">6 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <label className={labelClass}>Session Duration</label>
          <select className={selectClass} value={profileData.sessionDuration} onChange={(e) => updateField('sessionDuration', e.target.value)}>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
            <option value="75">75 min</option>
            <option value="90">90 min</option>
            <option value="120">120 min</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={labelClass}>Sleep Quality</label>
          <select className={selectClass} value={profileData.sleepQuality} onChange={(e) => updateField('sleepQuality', e.target.value)}>
            <option>Good</option>
            <option>Average</option>
            <option>Poor</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className={labelClass}>Stress Level</label>
          <select className={selectClass} value={profileData.stressLevel} onChange={(e) => updateField('stressLevel', e.target.value)}>
            <option>Low</option>
            <option>Moderate</option>
            <option>High</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <label className={labelClass}>Injuries / Limitations (Optional)</label>
        <textarea 
          className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm focus-visible:outline-none focus-visible:border-orange-500 resize-none text-slate-700 placeholder:text-slate-400"
          placeholder="e.g., Lower back pain, torn ACL (recovered), weak left shoulder..."
          rows={2}
          value={profileData.injuries} onChange={(e) => updateField('injuries', e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-11">
          ← Back
        </Button>
        <Button type="button" onClick={onNext} className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-500/20">
          Next — Nutrition →
        </Button>
      </div>
    </>
  );
};
