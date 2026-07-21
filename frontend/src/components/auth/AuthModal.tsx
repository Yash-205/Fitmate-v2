import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

import { AuthService } from '@/services/api';

// Props for AuthModal defining state and callbacks.
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
  // Callback after successful auth. hasProfile directs to onboarding vs dashboard
  onSuccess: (hasProfile: boolean) => void;
}

// Renders the authentication modal for user login and signup flows.
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login', onSuccess }) => {
  // Initialize state for view, auth data, errors, and loading status.
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset modal state to defaults whenever it opens.
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
      setAuthData({ name: '', email: '', password: '' });
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  // Handle form submission to login or signup via the API.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Execute login or signup based on current view.
      let data;
      if (view === 'signup') {
        data = await AuthService.signup(authData);
      } else {
        data = await AuthService.login({ email: authData.email, password: authData.password });
      }

      onSuccess(data.hasProfile);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Process successful Google OAuth login and update state.
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError('');
      
      const data = await AuthService.googleAuth(credentialResponse.credential);
      onSuccess(data.hasProfile);
    } catch (err: any) {
      setError(err.message || 'Google Auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Render modal backdrop and main container.
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-[440px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        // Prevent parent click handlers from firing (stops click-out to close from triggering here)
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-10 space-y-8">
          {/* Display view-specific title and description. */}
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
            {/* Show Full Name field only during signup. */}
            {view === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 ml-1">Full Name</label>
                <input
                  className="w-full h-12 rounded-xl bg-slate-50 border-transparent border-2 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500 transition-all outline-none"
                  type="text" placeholder="John Doe" required
                  value={authData.name} onChange={e => setAuthData({ ...authData, name: e.target.value })}
                />
              </div>
            )}

            {/* Email field configuration. */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 ml-1">Email</label>
              <input
                className="w-full h-12 rounded-xl bg-slate-50 border-transparent border-2 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500 transition-all outline-none"
                type="email" placeholder="coach@fitmate.ai" required
                value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })}
              />
            </div>

            {/* Password field configuration. */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 ml-1">Password</label>
              <input
                className="w-full h-12 rounded-xl bg-slate-50 border-transparent border-2 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500 transition-all outline-none"
                type="password" placeholder="••••••••" required
                value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold tracking-wide active:scale-95 transition-all mt-4 shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                view === 'login' ? 'Log In' : 'Sign Up'
              )}
            </Button>
          </form>

          {/* Separator for Google OAuth. */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>

          {/* Toggle button between login and signup views. */}
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
