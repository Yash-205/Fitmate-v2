import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

import { AuthService } from '@/services/api';

// Props for the AuthModal component. Keep these small and explicit so
// it's clear what the parent can control and what callbacks are required.
interface AuthModalProps {
  // whether the modal is visible
  isOpen: boolean;
  // close callback provided by parent (usually toggles isOpen)
  onClose: () => void;
  // initial view (login or signup) - useful if parent wants to deep-link
  initialView?: 'login' | 'signup';
  // callback after successful auth. receives a flag telling whether the
  // user already has a profile (used to direct onboarding vs. dashboard)
  onSuccess: (hasProfile: boolean) => void;
}

/**
 * Authentication Modal
 *
 * Provides a unified interface for user login and registration. Key responsibilities:
 * - Manage local form state (name/email/password)
 * - Call AuthService.login / AuthService.signup depending on the view
 * - Surface errors and loading UI
 * - Notify parent via onSuccess so the app can continue (e.g. show onboarding)
 *
 * Why this is a component: centralizes auth UI and logic so other pages can
 * open the modal without duplicating forms or validation.
 */
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login', onSuccess }) => {
  // which form to show: 'login' or 'signup'
  const [view, setView] = useState<'login' | 'signup'>(initialView);

  // auth form data. We keep it simple and flat for this modal.
  // Why single object? easier to reset and pass into AuthService calls.
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });

  // error message to display to the user
  const [error, setError] = useState('');

  // loading flag used to disable submit and show a spinner
  const [loading, setLoading] = useState(false);

  // When the modal opens we reset internal state. This ensures stale values
  // don't persist between different openings of the modal.
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
      setAuthData({ name: '', email: '', password: '' });
    }
    // only re-run when isOpen or initialView changes
  }, [isOpen, initialView]);

  // If the modal is not open we render nothing. This avoids attaching the
  // modal markup to the DOM when it's closed (and prevents trapping focus).
  if (!isOpen) return null;

  // Submit handler used for both login and signup flows. We keep one handler
  // to share loading/error behaviour and only switch the API call based on
  // the current `view` state.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // clear any previous error
    setLoading(true);

    try {
      // Choose API call based on current view. AuthService is a thin wrapper
      // around your backend endpoints - check services/api for implementation.
      const data = view === 'login'
        ? await AuthService.login({ email: authData.email, password: authData.password })
        : await AuthService.signup({ email: authData.email, password: authData.password, name: authData.name });

      // onSuccess tells the parent what to do next (e.g. close modal,
      // redirect to onboarding, or refresh user state). The `hasProfile`
      // flag comes from the backend and indicates if onboarding is needed.
      onSuccess(data.hasProfile);
    } catch (err: any) {
      // Show a human-friendly error. AuthService should throw an Error with
      // message populated, but you can customize handling here (e.g. map
      // status codes to messages).
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay: covers the screen and centers the modal. We use a semi-
    // transparent backdrop to focus the user's attention on the modal.
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/*
        Dialog container: visually the modal box. We set role/aria attributes
        for accessibility and stop propagation on clicks so clicks inside the
        modal don't close it (parent might have a click-to-close handler).
      */}
      <div
        className="bg-white w-full max-w-[440px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()} // prevent parent click handlers from firing
      >
        {/* Close button in the top-right corner. Calls onClose provided by parent. */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-10 space-y-8">
          <div className="space-y-2">
            {/* Title switches between Log In and Create Account */}
            <h2 id="auth-modal-title" className="text-2xl font-black text-slate-900">
              {view === 'login' ? 'Log In' : 'Create Account'}
            </h2>
            {/* Short description that changes based on view to give context */}
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {view === 'login'
                ? 'Log in to your FitCoach Pro account to continue your fitness journey.'
                : 'Join the next generation of AI-powered athletic coaching.'}
            </p>
          </div>

          {/* If there's an error show it here in a styled box. */}
          {error && (
            <div className="p-4 text-xs font-bold bg-red-50 text-red-600 rounded-xl border border-red-100 italic">
              {error}
            </div>
          )}

          {/* Form: shared between login and signup. We conditionally render
              the name field only for signup. */}
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 ml-1">Email</label>
              <input
                className="w-full h-12 rounded-xl bg-slate-50 border-transparent border-2 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500 transition-all outline-none"
                type="email" placeholder="coach@fitmate.ai" required
                value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 ml-1">Password</label>
              <input
                className="w-full h-12 rounded-xl bg-slate-50 border-transparent border-2 px-4 text-sm font-semibold focus:bg-white focus:border-orange-500 transition-all outline-none"
                type="password" placeholder="••••••••" required
                value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })}
              />
            </div>

            {/* Primary submit button. Disabled while loading so the user cannot
                send multiple requests. We show a simple spinner when loading. */}
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

          {/* View toggle: lets user switch between login and signup */}
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
