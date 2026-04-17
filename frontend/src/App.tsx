import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/common/Footer';
import MainLanding from './pages/MainLanding';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import Workout from './pages/Workout';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileSetupModal } from './components/profile-setup/ProfileSetupModal';

function App() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; view: 'login' | 'signup' }>({ 
    isOpen: false, 
    view: 'login' 
  });
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);

  const handleAuthSuccess = (hasProfile: boolean) => {
    setAuthModal({ ...authModal, isOpen: false });
    if (!hasProfile) {
      setIsProfileSetupOpen(true);
    } else {
      window.location.href = '/workout'; // Refresh to update navbar state
    }
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar onLoginClick={() => setAuthModal({ isOpen: true, view: 'login' })} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<MainLanding onGetStarted={() => setAuthModal({ isOpen: true, view: 'signup' })} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/workout" element={<Workout />} />
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
          window.location.href = '/workout';
        }}
      />
    </Router>
  );
}

export default App;
