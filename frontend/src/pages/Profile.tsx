import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileService, WorkoutService } from '@/services/api';
import type { WorkoutPlan } from '@/types/workout';
import { PhaseCalendar } from '@/components/workout/PhaseCalendar';
import { AthleteProfileCard } from '@/components/profile/AthleteProfileCard';
import { PhaseAccordion } from '@/components/profile/PhaseAccordion';
import { StrategySection } from '@/components/profile/StrategySection';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPhase, setExpandedPhase] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [profileData, planData] = await Promise.all([
          ProfileService.get(),
          WorkoutService.getPlan().catch(() => null)
        ]);
        setProfile(profileData);
        setPlan(planData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Split Type', value: plan?.splitType || '—' },
    { label: 'Primary Goal', value: plan?.goal || profile?.goal || '—' },
    { label: 'Experience', value: plan?.experienceLevel || profile?.trainingExperience || '—' },
    { label: 'Frequency', value: plan?.weeklyFrequency ? `${plan.weeklyFrequency}x / week` : `${profile?.availableDays || '—'}x / week` },
  ];

  return (
    <div className="bg-slate-50 font-sans pb-12">
      {/* ──────────────── Header ──────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-orange-600 text-[11px] font-bold uppercase tracking-[0.15em] mb-1">Training Roadmap</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Your Periodization Blueprint</h1>
            <p className="text-slate-400 mt-1 text-sm">Coach-designed macro strategy built from your assessment.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/profile-setup')} className="border-slate-200 text-slate-600 hover:bg-slate-50">
              Edit Assessment
            </Button>
            <Button onClick={() => navigate('/workout')} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-500/15">
              Go to Weekly Plan →
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">{error}</div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ──────────────── Quick Stats Row ──────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-lg font-black text-slate-900 tracking-tight leading-snug">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ──────────────── Main Grid ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ──── Left Column: Profile Card ──── */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-[80px] lg:self-start">
            <AthleteProfileCard profile={profile} />
            {plan && (
              <PhaseCalendar schedule={plan.schedule} mesoPhases={plan.mesoPhases} selectedDate={null} onSelectDate={() => {}} />
            )}
          </div>

          {/* ──── Right Column: Strategy + Mesocycles ──── */}
          <div className="lg:col-span-8 space-y-6">
            {!plan ? (
              <Card className="p-14 text-center border-dashed border-2 bg-white/60">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><path d="M12 2v20M2 12h20"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Building your roadmap...</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">Our AI is analyzing your assessment to design a periodized strategy.</p>
              </Card>
            ) : (
              <>
                <StrategySection plan={plan} />
                <PhaseAccordion mesoPhases={plan.mesoPhases} expandedPhase={expandedPhase} setExpandedPhase={setExpandedPhase} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
