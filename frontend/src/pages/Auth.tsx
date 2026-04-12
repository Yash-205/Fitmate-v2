import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = 'http://localhost:8000/api';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'signup' | 'profile-setup'>('login');
  
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  // Profile state for onboarding
  const [profileData, setProfileData] = useState({
    age: '',
    weight: '',
    goal: 'Weight Loss',
    experience: 'Beginner'
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authData.email, password: authData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('isLoggedIn', 'true');
      if (data.hasProfile) {
        navigate('/chat');
      } else {
        setView('profile-setup');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authData.email, password: authData.password, name: authData.name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('isLoggedIn', 'true');
      if (data.hasProfile) {
        navigate('/chat');
      } else {
        setView('profile-setup');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: Number(profileData.age),
          weight: Number(profileData.weight),
          goal: profileData.goal,
          experienceLevel: profileData.experience
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update profile');
      }
      
      navigate('/chat');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        
        {view === 'login' && (
          <Card className="w-full max-w-[440px] shadow-2xl bg-white/95 backdrop-blur-md border-none">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-slate-500">
                Log in to your FitMate account to continue your fitness journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && <div className="p-3 text-sm font-medium bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>}
              
              <form onSubmit={handleLoginSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
                  <input 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                    type="email" placeholder="your@email.com" required 
                    value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                  <input 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                    type="password" placeholder="••••••••" required 
                    value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} 
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                  Log In
                </Button>
              </form>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or continue with</span></div>
              </div>
              
              <Button variant="outline" className="w-full h-11 border-slate-200 hover:bg-slate-50 font-medium text-slate-700">
                Google
              </Button>
              
              <p className="text-center mt-4 text-sm text-slate-500">
                Don't have an account? <span onClick={() => {setView('signup'); setError('');}} className="text-orange-600 font-semibold cursor-pointer hover:underline">Sign up</span>
              </p>
            </CardContent>
          </Card>
        )}

        {view === 'signup' && (
          <Card className="w-full max-w-[440px] shadow-2xl bg-white/95 backdrop-blur-md border-none">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold tracking-tight">Create Your Account</CardTitle>
              <CardDescription className="text-slate-500">Join FitMate and start your transformation journey today.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && <div className="p-3 text-sm font-medium bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>}

              <form onSubmit={handleSignupSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</label>
                  <input 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                    type="text" placeholder="John Doe" required 
                    value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
                  <input 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                    type="email" placeholder="your@email.com" required 
                    value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                  <input 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                    type="password" placeholder="Minimum 6 characters" required 
                    value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} 
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/20 mt-2">
                  Create Account
                </Button>
              </form>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or continue with</span></div>
              </div>
              
              <Button variant="outline" className="w-full h-11 border-slate-200 hover:bg-slate-50 font-medium text-slate-700">Google</Button>
              
              <p className="text-center mt-4 text-sm text-slate-500">
                Already have an account? <span onClick={() => {setView('login'); setError('');}} className="text-orange-600 font-semibold cursor-pointer hover:underline">Log in</span>
              </p>
            </CardContent>
          </Card>
        )}

        {view === 'profile-setup' && (
          <Card className="w-full max-w-[440px] shadow-2xl bg-white/95 backdrop-blur-md border-none">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold tracking-tight">Complete Your Profile</CardTitle>
              <CardDescription className="text-slate-500">Help your AI coach understand you better to create the perfect plan.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && <div className="p-3 text-sm font-medium bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>}

              <form onSubmit={handleProfileSubmit} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Age</label>
                    <input 
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                      type="number" placeholder="e.g. 25" required 
                      value={profileData.age}
                      onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weight (kg)</label>
                    <input 
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                      type="number" placeholder="e.g. 70" required 
                      value={profileData.weight}
                      onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Main Fitness Goal</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                    value={profileData.goal}
                    onChange={(e) => setProfileData({...profileData, goal: e.target.value})}
                  >
                    <option>Weight Loss</option>
                    <option>Muscle Gain</option>
                    <option>Endurance</option>
                    <option>General Fitness</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Experience Level</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                
                <Button type="submit" className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/20 mt-4">
                  Start Chatting with AI Coach
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Auth;
