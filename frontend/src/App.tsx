import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/common/Footer';
import MainLanding from './pages/MainLanding';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import Workout from './pages/Workout';
import Trainers from './pages/Trainers';
import TrainerDashboard from './pages/TrainerDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileSetupModal } from './components/profile-setup/ProfileSetupModal';
import { TrainerSetupModal } from './components/profile-setup/TrainerSetupModal';

function App() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; view: 'login' | 'signup' }>({ 
    isOpen: false, 
    view: 'login' 
  });
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  // State for the professional trainer onboarding flow
  const [isTrainerSetupOpen, setIsTrainerSetupOpen] = useState(false);
  const handleAuthSuccess = (hasProfile: boolean) => {
    setAuthModal({ ...authModal, isOpen: false });
    if (!hasProfile) {
      // New users must always complete the base health assessment first
      setIsProfileSetupOpen(true);
    } else {
      /**
       * Multi-Persona Redirection Logic:
       * 1. If user is a 'trainer' but is missing their Professional Coach Profile 
       *    (certs, bio, specialization), force them into the Trainer Setup flow.
       * 2. If they are a verified coach with a complete profile, send to Trainer Dashboard.
       * 3. Otherwise, send to the Learner Workout Plan.
       */
      const role = localStorage.getItem('userRole');
      const hasTrainerProfile = localStorage.getItem('hasTrainerProfile') === 'true';
      
      if (role === 'trainer' && !hasTrainerProfile) {
        setIsTrainerSetupOpen(true);
      } else {
        // Set the default view mode for the user
        const defaultPersona = role === 'trainer' ? 'trainer' : 'learner';
        localStorage.setItem('activePersona', defaultPersona);
        window.location.href = defaultPersona === 'trainer' ? '/trainer/dashboard' : '/workout';
      }
    }
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar 
          onLoginClick={() => setAuthModal({ isOpen: true, view: 'login' })} 
        />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<MainLanding onGetStarted={() => setAuthModal({ isOpen: true, view: 'signup' })} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/workout" element={<Workout />} />
            {/* Discovery page for all users to find coaches */}
            <Route path="/trainers" element={
              <Trainers 
                onBecomeCoachClick={() => setIsTrainerSetupOpen(true)} 
                onLoginClick={() => setAuthModal({ isOpen: true, view: 'login' })}
              />
            } />
            {/* Secure dashboard for coaches to manage their assigned learners */}
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>

      <AuthModal 
        isOpen={authModal.isOpen} 
        initialView={authModal.view}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onSuccess={handleAuthSuccess}
      />

      <ProfileSetupModal 
        isOpen={isProfileSetupOpen}
        onSuccess={() => {
          setIsProfileSetupOpen(false);
          const role = localStorage.getItem('userRole');
          // After health assessment, check if they need trainer setup
          window.location.href = role === 'trainer' ? '/trainer/dashboard' : '/workout';
        }}
      />

      {/* Professional Trainer Persona Onboarding Modal */}
      <TrainerSetupModal
        isOpen={isTrainerSetupOpen}
        onClose={() => setIsTrainerSetupOpen(false)}
        onSuccess={() => {
          setIsTrainerSetupOpen(false);
          window.location.href = '/trainer/dashboard';
        }}
      />
    </Router>
  );
}

export default App;
