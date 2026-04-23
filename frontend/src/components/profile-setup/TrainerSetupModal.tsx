import React, { useState } from 'react';
import { TrainerService } from '@/services/api';

interface TrainerSetupModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const TrainerSetupModal: React.FC<TrainerSetupModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [trainerData, setTrainerData] = useState({
    fullName: '',
    specialization: '',
    bio: '',
    certifications: '',
    experienceYears: '0',
    hourlyRate: '',
  });

  if (!isOpen) return null;

  const updateField = (field: string, value: string) => {
    setTrainerData(prev => ({ ...prev, [field]: value }));
  };

  const handleTrainerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!trainerData.fullName || !trainerData.specialization || !trainerData.bio) {
      setError("Please fill out all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      await TrainerService.upsertProfile({
        ...trainerData,
        specialization: trainerData.specialization.split(',').map(s => s.trim()),
        certifications: trainerData.certifications.split(',').map(c => c.trim()),
        experienceYears: Number(trainerData.experienceYears),
        hourlyRate: trainerData.hourlyRate ? Number(trainerData.hourlyRate) : undefined,
      });
      
      // Update local storage to reflect the new trainer status and active persona
      localStorage.setItem('userRole', 'trainer');
      localStorage.setItem('hasTrainerProfile', 'true');
      localStorage.setItem('activePersona', 'trainer');
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputClass = "flex h-12 w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none";
  const textareaClass = "flex min-h-[100px] w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-4 py-3 text-sm font-semibold focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none resize-none";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-[620px] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-10 pt-10 pb-6 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h3 className="text-3xl font-black tracking-tight text-slate-900">Become a Coach</h3>
              <p className="text-sm text-slate-400 font-medium">Activate your professional trainer persona.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-10 pb-10 space-y-6">
          {error && (
             <div className="p-4 text-xs font-bold bg-red-50 text-red-600 rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleTrainerSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Professional Name *</label>
              <input 
                className={inputClass}
                placeholder="How clients should address you"
                value={trainerData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Specializations *</label>
                <input 
                  className={inputClass}
                  placeholder="Strength, HIIT, Yoga"
                  value={trainerData.specialization}
                  onChange={(e) => updateField('specialization', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Experience (Years)</label>
                <input 
                  type="number"
                  className={inputClass}
                  value={trainerData.experienceYears}
                  onChange={(e) => updateField('experienceYears', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Bio / Professional Summary *</label>
              <textarea 
                className={textareaClass}
                placeholder="Tell potential clients about your coaching philosophy..."
                value={trainerData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Certifications (Comma separated)</label>
              <input 
                className={inputClass}
                placeholder="NASM-CPT, Precision Nutrition..."
                value={trainerData.certifications}
                onChange={(e) => updateField('certifications', e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-600 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Launch Coaching Profile"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
