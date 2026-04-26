import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileService, WorkoutService, AuthService } from '@/services/api';
import { FaSignOutAlt, FaExchangeAlt } from 'react-icons/fa';
import type { WorkoutPlan } from '@/types/workout';
import { PhaseCalendar } from '@/components/workout/PhaseCalendar';
import { AthleteProfileCard } from '@/components/profile/AthleteProfileCard';
import { PhaseAccordion } from '@/components/profile/PhaseAccordion';
import { StrategySection } from '@/components/profile/StrategySection';

/**
 * Profile Page
 * 
 * Displays the long-term periodization blueprint and athlete assessment results.
 * It provides a high-level overview of the training strategy and allows users
 * to switch between Athlete and Coach personas if they are verified trainers.
 */
const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole] = useState<string | null>(localStorage.getItem('userRole'));
  const [activePersona, setActivePersona] = useState<'learner' | 'trainer'>(localStorage.getItem('activePersona') as 'learner' | 'trainer' || 'learner');
  
  // Calendar & Phase Management (Synced with Workout Page)
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);

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

  const handleLogout = () => {
    // Clear all session data and redirect to landing
    AuthService.logout();
    navigate('/');
    window.location.reload(); // Ensure all state is cleared
  };

  /**
   * Switches the user's active persona and forces a full application reload.
   * Hard refresh is used to ensure persona-specific logic (e.g. NavLinks, Route Guards)
   * is correctly re-evaluated.
   */
  const handlePersonaChange = (newPersona: 'learner' | 'trainer') => {
    setActivePersona(newPersona);
    localStorage.setItem('activePersona', newPersona);
    window.location.href = newPersona === 'trainer' ? '/trainer/dashboard' : '/workout';
  };

  const handlePhaseChange = (index: number) => {
    setCurrentPhaseIndex(index);
    if (!plan?.mesoPhases?.[0]) return;
    const firstPhaseDate = new Date(plan.mesoPhases[0].startDate);
    const targetPhaseDate = new Date(plan.mesoPhases[index].startDate);
    const yearsDiff = targetPhaseDate.getFullYear() - firstPhaseDate.getFullYear();
    const monthsDiff = targetPhaseDate.getMonth() - firstPhaseDate.getMonth();
    setMonthOffset(yearsDiff * 12 + monthsDiff);
  };

  const handleMonthChange = (offset: number) => {
    setMonthOffset(offset);
    if (!plan?.mesoPhases) return;
    const firstPhaseDate = new Date(plan.mesoPhases[0].startDate);
    const targetMonthDate = new Date(firstPhaseDate);
    targetMonthDate.setMonth(targetMonthDate.getMonth() + offset);
    targetMonthDate.setDate(1);
    const phaseIndex = plan.mesoPhases.findIndex(p => {
      const start = new Date(p.startDate).setHours(0,0,0,0);
      const end = new Date(p.endDate).setHours(23,59,59,999);
      return targetMonthDate.getTime() >= start && targetMonthDate.getTime() <= end;
    });
    if (phaseIndex !== -1 && phaseIndex !== currentPhaseIndex) {
      setCurrentPhaseIndex(phaseIndex);
    }
  };

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
          <div className="flex items-center gap-3">
            {/* 
              ROLE SWITCHER DROPDOWN
              Allows trainers to switch between Coach and Athlete views.
              Shared logic with the Navbar switcher.
            */}
            {(userRole === 'trainer' || activePersona === 'trainer' || localStorage.getItem('hasTrainerProfile') === 'true') && (
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <FaExchangeAlt size={12} />
                </div>
                <select 
                  value={activePersona}
                  onChange={(e) => handlePersonaChange(e.target.value as 'learner' | 'trainer')}
                  className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <option value="learner">Athlete Mode</option>
                  <option value="trainer">Coach Mode</option>
                </select>
                <div className="absolute right-3 text-slate-400 pointer-events-none">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            )}

            <Button variant="outline" onClick={() => navigate('/profile-setup')} className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-5 h-10 font-bold">
              Edit Assessment
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl px-4 h-10 flex items-center gap-2 font-bold"
            >
              <FaSignOutAlt size={14} />
              <span>Log Out</span>
            </Button>

            <Button onClick={() => navigate('/workout')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl px-6 h-10 shadow-lg shadow-orange-500/20 transition-all active:scale-95">
              Weekly Plan →
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
              <PhaseCalendar 
                schedule={plan.schedule} 
                mesoPhases={plan.mesoPhases} 
                selectedDate={selectedDateFilter} 
                onSelectDate={setSelectedDateFilter}
                monthOffset={monthOffset}
                onMonthChange={handleMonthChange}
              />
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
                <PhaseAccordion 
                  mesoPhases={plan.mesoPhases} 
                  expandedPhase={currentPhaseIndex} // Use currentPhaseIndex for expansion
                  setExpandedPhase={handlePhaseChange} // Use handlePhaseChange for manual clicks
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
