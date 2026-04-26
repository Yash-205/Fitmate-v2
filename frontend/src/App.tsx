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
import { useAppFlow } from './hooks/useAppFlow';

/**
 * Main Application Component
 * 
 * This file is now the "Map" of your app. It handles the URL routing and 
 * displays the global modals (Auth, Profile, Trainer Setup) when the 
 * "Brain" (useAppFlow hook) tells it to.
 */
function App() {
  // We extract all our state and logic from the useAppFlow custom hook.
  // This keeps the App component clean and focused on layout/routing.
  const { 
    authModal, 
    isProfileSetupOpen, 
    isTrainerSetupOpen,
    openLogin,
    openSignup,
    closeAuth,
    openTrainerSetup,
    closeTrainerSetup,
    handleAuthSuccess,
    handleSetupSuccess 
  } = useAppFlow();

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* The Navigation Bar - Always visible */}
        {/* We pass 'openLogin' so the Login button in the Navbar works */}
        <Navbar onLoginClick={openLogin} onSignupClick={openSignup} />
        
        {/* The Main Content Area - Changes based on the URL (Route) */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Landing Page - Home */}
            <Route path="/" element={<MainLanding onGetStarted={openSignup} />} />
            
            {/* Athlete's personal profile settings */}
            <Route path="/profile" element={<Profile />} />
            
            {/* AI Coaching Chat Interface */}
            <Route path="/chat" element={<Chatbot />} />
            
            {/* Personalized AI Workout Plan Dashboard */}
            <Route path="/workout" element={<Workout />} />
            
            {/* Marketplace for finding and connecting with trainers */}
            <Route path="/trainers" element={
              <Trainers 
                onBecomeCoachClick={openTrainerSetup} 
                onLoginClick={openLogin}
                onSignupClick={openSignup}
              />
            } />
            
            {/* Management dashboard for Trainers (Coach Mode) */}
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            
            {/* Catch-all: Redirect unknown URLs back to the Landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>

      {/* --- GLOBAL MODALS --- */}
      {/* These modals are controlled by the state inside the 'useAppFlow' hook */}

      {/* 1. Authentication Modal: Handles Login and Signup */}
      <AuthModal 
        isOpen={authModal.isOpen} 
        initialView={authModal.view}
        onClose={closeAuth}
        onSuccess={handleAuthSuccess} // When successful, the hook decides where to send the user
      />

      {/* 2. Health Assessment Modal: Collected physical metrics for new users */}
      <ProfileSetupModal 
        isOpen={isProfileSetupOpen}
        onSuccess={() => handleSetupSuccess('profile')} // Closes modal and redirects to workout
      />

      {/* 3. Professional Trainer Setup Modal: Collects bio/certs for coaches */}
      <TrainerSetupModal
        isOpen={isTrainerSetupOpen}
        onClose={closeTrainerSetup}
        onSuccess={() => handleSetupSuccess('trainer')} // Closes modal and redirects to dashboard
      />
    </Router>
  );
}

export default App;
