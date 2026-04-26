import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

import { AuthService } from '@/services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
  onSuccess: (hasProfile: boolean) => void;
}

/**
 * Authentication Modal
 * 
 * Provides a unified interface for user login and registration.
 * It manages form state, handles API communication via AuthService,
 * and triggers onboarding flows upon successful authentication.
 */
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login', onSuccess }) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
      setAuthData({ name: '', email: '', password: '' });
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = view === 'login' 
        ? await AuthService.login({ email: authData.email, password: authData.password })
        : await AuthService.signup({ email: authData.email, password: authData.password, name: authData.name });
      
      onSuccess(data.hasProfile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-[440px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-10 space-y-8">
          <div className="space-y-2">
            <h2 id="auth-modal-title" className="text-2xl font-black text-slate-900">
              {view === 'login' ? 'Log In' : 'Create Account'}
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {view === 'login' 
                ? 'Log in to your FitCoach Pro account to continue your fitness journey.' 
                : 'Join the next generation of AI-powered athletic coaching.'}
            </p>
          </div>

          {error && (
            <div className="p-4 text-xs font-bold bg-red-50 text-red-600 rounded-xl border border-red-100 italic">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {view === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 ml-1">Full Name</label>
                <input 
                  className="w-full h-12 rounded-xl bg-slate-50 border-transparent border-2 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500 transition-all outline-none"
                  type="text" placeholder="John Doe" required 
                  value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} 
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 ml-1">Email</label>
              <input 
                className="w-full h-12 rounded-xl bg-slate-50 border-transparent border-2 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500 transition-all outline-none"
                type="email" placeholder="coach@fitmate.ai" required 
                value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 ml-1">Password</label>
              <input 
                className="w-full h-12 rounded-xl bg-slate-50 border-transparent border-2 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500 transition-all outline-none"
                type="password" placeholder="••••••••" required 
                value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} 
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#FF4500] hover:bg-[#E63E00] text-white font-bold tracking-wide active:scale-95 transition-all mt-4 shadow-lg shadow-orange-600/20"
            >
              {loading ? 'Processing...' : view === 'login' ? 'Log In' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-slate-500">
            {view === 'login' ? "Don't have an account?" : "Already a member?"}
            <button 
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
              className="ml-1 text-orange-600 font-bold hover:underline"
              data-testid="auth-view-toggle"
            >
              {view === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
