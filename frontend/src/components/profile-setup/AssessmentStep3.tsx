import React from 'react';
import { Button } from "@/components/ui/button";

interface AssessmentStep3Props {
  profileData: any;
  updateField: (field: string, value: string) => void;
  onBack: () => void;
  loading: boolean;
  labelClass: string;
  selectClass: string;
}

export const AssessmentStep3: React.FC<AssessmentStep3Props> = ({ 
  profileData, updateField, onBack, loading, labelClass, selectClass 
}) => {
  return (
    <>
      <div className="grid gap-2">
        <label className={labelClass}>Dietary Preference</label>
        <select className={selectClass} value={profileData.diet} onChange={(e) => updateField('diet', e.target.value)}>
          <option>Standard (No Restrictions)</option>
          <option>High Protein</option>
          <option>Vegetarian</option>
          <option>Vegan</option>
          <option>Keto</option>
          <option>Pescatarian</option>
        </select>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assessment Summary</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <span className="text-slate-500">Age / Gender</span>
          <span className="font-semibold text-slate-700">{profileData.age} / {profileData.gender}</span>
          
          <span className="text-slate-500">Height / Weight</span>
          <span className="font-semibold text-slate-700">{profileData.height}cm / {profileData.weight}kg</span>
          
          <span className="text-slate-500">Experience</span>
          <span className="font-semibold text-slate-700">{profileData.trainingExperience}</span>
          
          <span className="text-slate-500">Schedule</span>
          <span className="font-semibold text-slate-700">{profileData.availableDays}x/week • {profileData.sessionDuration}min</span>
          
          <span className="text-slate-500">Recovery</span>
          <span className="font-semibold text-slate-700">Sleep: {profileData.sleepQuality} | Stress: {profileData.stressLevel}</span>
          
          <span className="text-slate-500">Diet</span>
          <span className="font-semibold text-slate-700">{profileData.diet}</span>

          {profileData.injuries && (
            <>
              <span className="text-slate-500">Injuries</span>
              <span className="font-semibold text-orange-700">{profileData.injuries}</span>
            </>
          )}
        </div>
        <div className="pt-2 mt-2 border-t border-slate-200">
          <span className="text-slate-500 text-xs">Goal: </span>
          <span className="text-xs font-medium text-slate-700">{profileData.goal}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-12">
          ← Back
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-lg shadow-orange-500/20 text-md tracking-wide transition-all active:scale-[0.98]"
        >
          {loading ? 'Building Profile...' : 'Create My Program'}
        </Button>
      </div>
    </>
  );
};
