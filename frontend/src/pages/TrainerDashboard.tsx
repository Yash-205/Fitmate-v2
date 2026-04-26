import { useEffect, useState } from 'react';
import { TrainerService } from '@/services/api';

/**
 * Trainer Dashboard
 * 
 * Provides a specialized interface for professional trainers.
 * Allows coaches to:
 * - View and manage their professional profile details.
 * - Track their total client count.
 * - Monitor the progress and baseline metrics of their assigned athletes/learners.
 */
export default function TrainerDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainerProfile, setTrainerProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, clientsData] = await Promise.all([
          TrainerService.getProfile(),
          TrainerService.getClients()
        ]);
        setTrainerProfile(profile);
        setClients(clientsData);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2">Trainer Dashboard</h1>
          <p className="text-lg text-slate-500 font-medium italic">Welcome back, {trainerProfile?.fullName}!</p>
        </div>
        <div className="bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100">
          <span className="text-orange-600 font-black uppercase tracking-widest text-xs">Total Clients: {clients.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white text-sm">P</span>
              Your Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Specializations</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {trainerProfile?.specialization.map((s: string) => (
                    <span key={s} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-100">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bio</label>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{trainerProfile?.bio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clients List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm min-h-[400px]">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white text-sm">C</span>
              Assigned Clients
            </h2>
            
            {clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 font-bold">No clients assigned yet.</p>
                <p className="text-xs text-slate-300 max-w-[240px] mt-2">Clients will appear here once they select you as their coach.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map(client => (
                  <div key={client._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-orange-200 transition-colors group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{client.userId?.email ? client.userId.email.split('@')[0] : 'Athlete'}</h3>
                        <p className="text-xs text-slate-400 font-medium">{client.userId?.email || 'Registered Client'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Goal</span>
                        <span className="text-sm font-bold text-orange-600">{client.goal}</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Weight</label>
                        <p className="text-sm font-bold text-slate-600">{client.weight}kg</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Days/Week</label>
                        <p className="text-sm font-bold text-slate-600">{client.availableDays}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Exp</label>
                        <p className="text-sm font-bold text-slate-600 text-ellipsis overflow-hidden whitespace-nowrap">{client.trainingExperience}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
