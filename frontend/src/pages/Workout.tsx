import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_URL = 'http://localhost:8000/api';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

interface DayPlan {
  day: string;
  date: string;
  focus: string;
  dailyObjective: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  _id: string;
  goal: string;
  splitType: string;
  overarchingStrategy: string;
  weeklyGoal: string;
  schedule: DayPlan[];
  createdAt: string;
}

const Workout: React.FC = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');

      const res = await fetch(`${API_URL}/workout`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 404) {
        setPlan(null);
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch workout plan');
      const data = await res.json();
      setPlan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [navigate]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/workout/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate plan');

      setPlan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Workout Plan</h1>
            <p className="text-slate-500 mt-1">Personalized multi-day fitness schedule.</p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/20"
          >
            {generating ? 'AI Generating...' : plan ? 'Regenerate Plan' : 'Generate New Plan'}
          </Button>
        </header>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}

        {!plan && !generating && !error && (
          <Card className="border-dashed border-2 bg-transparent text-center p-12">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💪</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No active workout plan</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Have the AI coach generate a routine based exactly on your profile, goals, and experience level.
              </p>
              <Button onClick={handleGenerate} className="bg-orange-600 hover:bg-orange-700 text-white w-full">
                Generate AI Workout
              </Button>
            </div>
          </Card>
        )}

        {generating && (
          <Card className="p-12 text-center bg-white shadow-sm border-slate-200">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-slate-900">Crafting your perfect routine...</h3>
            <p className="text-slate-500 text-sm mt-2">Analyzing your goal and body composition metrics.</p>
          </Card>
        )}

        {plan && !generating && (
          <div className="space-y-8">

            {/* Macro Strategy Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-semibold tracking-wide uppercase">
                  {plan.splitType}
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold tracking-wide uppercase">
                  Goal: {plan.goal}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">The Strategy</h3>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {plan.overarchingStrategy}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                  <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    🎯 Weekly Focus
                  </h3>
                  <p className="text-orange-900 font-medium">
                    {plan.weeklyGoal}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Breakdown Section */}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Daily Breakdown</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plan.schedule.map((day, dIdx) => {
                  // Safely parse the calendar date from the backend
                  const planDate = new Date(day.date);
                  const today = new Date();
                  
                  // Check if this card's date exactly matches TODAY
                  const isToday = 
                    planDate.getDate() === today.getDate() &&
                    planDate.getMonth() === today.getMonth() &&
                    planDate.getFullYear() === today.getFullYear();
                  
                  // Format beautifully: "Sun, Apr 12"
                  const formattedDate = planDate.toLocaleDateString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric' 
                  });

                  return (
                    <Card 
                      key={dIdx} 
                      className={`flex flex-col h-full transition-all duration-300 relative overflow-visible ${
                        isToday 
                          ? 'border-orange-500 border-2 shadow-lg shadow-orange-500/10 scale-[1.02] bg-white ring-4 ring-orange-500/10' 
                          : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isToday && (
                        <div className="absolute -top-3 -right-3 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-md z-10 animate-pulse">
                          Today
                        </div>
                      )}
                      
                      <CardHeader className={`pb-4 border-b ${isToday ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50/80 border-slate-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <CardDescription className={`uppercase tracking-wider font-bold text-xs ${isToday ? 'text-orange-700' : 'text-orange-600'}`}>
                            {day.day} • {formattedDate}
                          </CardDescription>
                        </div>
                        <CardTitle className="text-lg leading-tight mb-2">{day.focus}</CardTitle>
                        
                        {/* Daily Objective */}
                        <div className={`rounded-md p-3 border mt-2 ${isToday ? 'bg-white/90 border-orange-200/60 shadow-sm' : 'bg-white/60 border-slate-200/60'}`}>
                          <p className={`text-xs font-medium italic ${isToday ? 'text-orange-900' : 'text-slate-600'}`}>
                            "{day.dailyObjective}"
                          </p>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-0 flex-1 bg-white rounded-b-xl">
                        {day.exercises.length === 0 ? (
                          <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                            <span className="text-3xl mb-2">🧘</span>
                            <span className="text-slate-500 font-medium">Rest & Recovery</span>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {day.exercises.map((ex, eIdx) => (
                              <div key={eIdx} className="p-4 hover:bg-slate-50/50 transition-colors">
                                <div className="flex justify-between items-start mb-1 gap-4">
                                  <span className="font-semibold text-slate-800 text-sm leading-tight">{ex.name}</span>
                                  <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${isToday ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {ex.sets}x {ex.reps}
                                  </span>
                                </div>
                                {ex.notes && <p className="text-xs text-slate-500 mt-1.5">{ex.notes}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workout;
