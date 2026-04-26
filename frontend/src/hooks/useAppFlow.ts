import { useState } from 'react';

// Defines the two possible states for the Authentication Modal
export type AuthModalView = 'login' | 'signup';

// Why do it this way?
// Encapsulation: It's like a Toolbox.
// Instead of having 10 loose tools lying around your App.tsx, you have one neat toolbox.
// Reusability: Because it's an object, any other component
//  (like a "Profile" page or a "Header") could also call 
// useAppFlow() and get access to the exact same tools without you having to rewrite the code.

/**
 * useAppFlow Hook
 * 
 * This is the "Brain" of your application's flow. It manages:
 * 1. Which modals are open (Login, Health Assessment, or Trainer Setup).
 * 2. Where the user should be redirected after they take an action.
 */
export function useAppFlow() {
  // --- 1. STATE DEFINITIONS ---

  // Manages the Authentication (Login/Signup) modal state
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; view: AuthModalView }>({ 
    isOpen: false, // Hidden by default
    view: 'login'  // Defaults to the login view
  });
  
  // Controls the "Health Assessment" (ProfileSetupModal) visibility
  // This is shown to every new user before they can see a workout plan.
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);

  // Controls the "Professional Trainer Onboarding" (TrainerSetupModal) visibility
  // This is shown when a user wants to become a coach on the platform.
  const [isTrainerSetupOpen, setIsTrainerSetupOpen] = useState(false);

  // --- 2. LOGIC HANDLERS ---

  /**
   * Called by the AuthModal when a user successfully logs in or signs up.
   * @param hasProfile - Boolean from the backend telling us if the user has completed their health assessment.
   */
  const handleAuthSuccess = (hasProfile: boolean) => {
    // First, close the Auth modal regardless of the next step
    setAuthModal(prev => ({ ...prev, isOpen: false }));
    
    if (!hasProfile) {
      // SCENARIO: New user with no health data.
      // Trigger the ProfileSetupModal immediately to collect their metrics.
      setIsProfileSetupOpen(true);
    } else {
      // SCENARIO: Returning user. We check their role to decide where to send them.
      const role = localStorage.getItem('userRole'); // 'learner' or 'trainer'
      const hasTrainerProfile = localStorage.getItem('hasTrainerProfile') === 'true';
      
      if (role === 'trainer' && !hasTrainerProfile) {
        // This user is a Trainer but hasn't filled out their professional bio/certs yet.
        // Trigger the TrainerSetupModal.
        setIsTrainerSetupOpen(true);
      } else {
        // Standard user or completed coach.
        // We set their 'activePersona' and redirect them to their dashboard.
        const defaultPersona = role === 'trainer' ? 'trainer' : 'learner';
        localStorage.setItem('activePersona', defaultPersona);
        
        // window.location.href is used to force a full reload and reset the app state/nav
        window.location.href = defaultPersona === 'trainer' ? '/trainer/dashboard' : '/profile';
      }
    }
  };

  /**
   * Called after a user successfully finishes one of the setup wizards.
   * @param type - Which modal was just completed.
   */
  const handleSetupSuccess = (type: 'profile' | 'trainer') => {
    if (type === 'profile') {
      // Health Assessment finished.
      setIsProfileSetupOpen(false);
      const role = localStorage.getItem('userRole');
      // If they are a trainer, they go to their dashboard; otherwise, they see their training blueprint (profile).
      window.location.href = role === 'trainer' ? '/trainer/dashboard' : '/profile';
    } else {
      // Trainer Profile (bio/certs) finished.
      setIsTrainerSetupOpen(false);
      // Redirect to their professional management dashboard.
      window.location.href = '/trainer/dashboard';
    }
  };

  // --- 3. EXPORTED API ---
  // We return these so App.tsx can use them to control the UI.
  return {
    // Current visibility states
    authModal,
    isProfileSetupOpen,
    isTrainerSetupOpen,
    
    // Simple functions to open/close modals from the Navbar or Landing page
    openLogin: () => setAuthModal({ isOpen: true, view: 'login' }),
    openSignup: () => setAuthModal({ isOpen: true, view: 'signup' }),
    closeAuth: () => setAuthModal(prev => ({ ...prev, isOpen: false })),
    openTrainerSetup: () => setIsTrainerSetupOpen(true),
    closeTrainerSetup: () => setIsTrainerSetupOpen(false),
    
    // Complex logic handlers defined above
    handleAuthSuccess,
    handleSetupSuccess,
  };
}
