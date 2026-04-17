import React, { useState } from 'react';
import { ProfileService } from '@/services/api';
import { AssessmentStep1 } from '@/components/profile-setup/AssessmentStep1';
import { AssessmentStep2 } from '@/components/profile-setup/AssessmentStep2';
import { AssessmentStep3 } from '@/components/profile-setup/AssessmentStep3';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onSuccess }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [profileData, setProfileData] = useState({
    age: '', gender: 'Male', weight: '', height: '', goal: '',
    trainingExperience: 'Beginner (<1 year)', injuries: '',
    availableDays: '4', sessionDuration: '60', sleepQuality: 'Average',
    stressLevel: 'Moderate', diet: 'Standard',
  });

  if (!isOpen) return null;

  const updateField = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!profileData.age || !profileData.weight || !profileData.height || !profileData.goal) {
      setError("Please fill out all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      await ProfileService.upsert({
        age: Number(profileData.age), gender: profileData.gender,
        weight: Number(profileData.weight), height: Number(profileData.height),
        goal: profileData.goal, trainingExperience: profileData.trainingExperience,
        injuries: profileData.injuries, availableDays: Number(profileData.availableDays),
        sessionDuration: Number(profileData.sessionDuration), sleepQuality: profileData.sleepQuality,
        stressLevel: profileData.stressLevel, diet: profileData.diet,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputClass = "flex h-12 w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none";
  const selectClass = "flex h-12 w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none cursor-pointer";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-[620px] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="px-10 pt-10 pb-6 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h3 className="text-3xl font-black tracking-tight text-slate-900">Final Assessment</h3>
              <p className="text-sm text-slate-400 font-medium">Step {step} of 3 — Personalized configuration.</p>
            </div>
            {/* Steps Progress */}
            <div className="flex gap-2 pt-4">
              {[1, 2, 3].map(s => (
                <div 
                  key={s} 
                  className={`h-1.5 w-12 rounded-full transition-all duration-500 ${s <= step ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-100'}`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-10 pb-10 space-y-6">
          {error && (
             <div className="p-4 text-xs font-bold bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="min-h-[320px] animate-in fade-in slide-in-from-bottom-2 duration-500">
              {step === 1 && (
                <AssessmentStep1 
                  profileData={profileData} updateField={updateField} labelClass={labelClass} inputClass={inputClass} selectClass={selectClass}
                  onNext={() => {
                    if (!profileData.age || !profileData.weight || !profileData.height || !profileData.goal) {
                      setError("Please fill out all fields before continuing."); return;
                    }
                    setError(''); setStep(2);
                  }} 
                />
              )}

              {step === 2 && (
                <AssessmentStep2 
                  profileData={profileData} updateField={updateField} labelClass={labelClass} selectClass={selectClass}
                  onBack={() => setStep(1)} onNext={() => { setError(''); setStep(3); }} 
                />
              )}

              {step === 3 && (
                <AssessmentStep3 
                  profileData={profileData} updateField={updateField} labelClass={labelClass} selectClass={selectClass}
                  onBack={() => setStep(2)} loading={loading} 
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
