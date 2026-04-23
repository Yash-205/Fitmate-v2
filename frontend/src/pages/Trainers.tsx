import { useEffect, useState } from 'react';
import { TrainerService, ProfileService } from '@/services/api';

/**
 * Trainers Discovery Page
 * 
 * This page allows Learners to browse all active professional coaches on the platform.
 * It uses the 'Persona-based' architecture to fetch only active Trainer documents
 * while keeping the interface focused on coach discovery.
 */
interface TrainersProps {
  onBecomeCoachClick: () => void;
  onLoginClick: () => void;
}

export default function Trainers({ onBecomeCoachClick, onLoginClick }: TrainersProps) {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTrainerId, setCurrentTrainerId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Fetch the list of active trainers from the discovery endpoint.
     * This endpoint is optimized to return only professional data (bio, specialization)
     * and excludes sensitive user-auth information.
     */
    const fetchData = async () => {
      try {
        setLoading(true);
        /**
         * Fetch active trainers for discovery.
         * If the user is logged in (has token), we also fetch their profile to show connection status.
         */
        const hasToken = !!localStorage.getItem('token');
        const [trainerData, profileData] = await Promise.all([
          TrainerService.getDiscovery(),
          hasToken ? ProfileService.get().catch(() => null) : Promise.resolve(null)
        ]);
        setTrainers(trainerData);
        if (profileData?.trainerId) {
          setCurrentTrainerId(profileData.trainerId);
        }
      } catch (err: any) {
        console.error("Discovery Error:", err);
        setError("Failed to load coaches. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConnect = async (trainerId: string) => {
    // If user is not logged in, show the auth modal instead of connecting
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      onLoginClick();
      return;
    }

    try {
      setConnectingId(trainerId);
      await ProfileService.selectTrainer(trainerId);
      setCurrentTrainerId(trainerId);
    } catch (err) {
      console.error("Connection failed", err);
    } finally {
      setConnectingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-12 w-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse">Finding the best coaches for you...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* ──────────────── Header Section ──────────────── */}
      <header className="mb-16 text-center">
        <h1 className="text-6xl font-black tracking-tight text-slate-900 mb-4">
          World-Class <span className="text-orange-600">Trainers</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Connect with certified professionals dedicated to helping you crush your fitness goals.
        </p>
      </header>

      {error ? (
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-center">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      ) : trainers.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-black text-xl">No active coaches at the moment.</p>
          <p className="text-slate-300 mt-2">Check back soon as our community grows!</p>
        </div>
      ) : (
        /* ──────────────── Discovery Grid ──────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer: any) => (
            <div 
              key={trainer._id} 
              className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
            >
              {/* Coach Identity Section */}
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-500">
                  {trainer.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{trainer.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Coach</span>
                  </div>
                </div>
              </div>

              {/* Specializations Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {trainer.specialization.map((spec: string) => (
                  <span 
                    key={spec} 
                    className="px-4 py-1.5 bg-slate-50 text-slate-600 text-[11px] font-bold rounded-xl border border-slate-100 group-hover:border-orange-200 group-hover:bg-orange-50/30 transition-colors"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Bio & Professional Details */}
              <div className="space-y-4 mb-8 flex-grow">
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{trainer.bio}"
                </p>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Experience</label>
                    <p className="text-sm font-black text-slate-700">{trainer.experienceYears} Years</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Rating</label>
                    <p className="text-sm font-black text-orange-600 flex items-center gap-1">
                      ★ {trainer.rating || "5.0"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interaction CTA */}
              <button 
                onClick={() => handleConnect(trainer._id)}
                disabled={currentTrainerId === trainer._id || !!connectingId}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  currentTrainerId === trainer._id 
                    ? "bg-green-100 text-green-700 border-2 border-green-200 cursor-default shadow-none" 
                    : "bg-slate-900 text-white hover:bg-orange-600 shadow-slate-900/10 hover:shadow-orange-500/20"
                }`}
              >
                {connectingId === trainer._id ? (
                   <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : currentTrainerId === trainer._id ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    My Coach
                  </>
                ) : (
                  "Connect to Trainer"
                )}
              </button>
              
              <p className="text-[9px] text-center mt-3 text-slate-300 font-bold uppercase tracking-tighter">
                {currentTrainerId === trainer._id ? "Active Connection" : "Free for a limited time"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ──────────────── Become a Coach CTA ──────────────── */}
      {/* 
        This section encourages existing users to transition to the Trainer persona.
        We only show this if the user isn't already a trainer (checked via userRole in localStorage).
      */}
      {localStorage.getItem('userRole') !== 'trainer' && (
        <section className="mt-32 p-12 bg-slate-900 rounded-[3rem] text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full -translate-y-32 translate-x-32 blur-3xl group-hover:bg-orange-600/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full translate-y-32 -translate-x-32 blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Are you a Professional Coach?</h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto mb-10 leading-relaxed">
              Join our elite community of trainers and help users around the world reach their peak potential.
            </p>
            <button 
              onClick={onBecomeCoachClick}
              className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-500 transition-all hover:scale-[1.05] active:scale-95 shadow-xl shadow-orange-600/20"
            >
              Start Coaching with FitMate
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
