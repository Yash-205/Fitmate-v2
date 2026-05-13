import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { Dumbbell } from 'lucide-react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

// Props for the Navbar component
interface NavbarProps {
  onLoginClick: () => void; // Function to trigger the Login view
  onSignupClick: () => void; // Function to trigger the Signup view
}

/**
 * Global Navigation Bar
 * 
 * Provides primary navigation links and dynamic persona switching logic.
 * It adapts based on the user's authentication state and their active role 
 * (Athlete vs. Coach).
 */
const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onSignupClick }) => {
  // --- 1. HOOKS & ROUTING ---
  const location = useLocation(); // Allows us to track which page the user is currently on
  const navigate = useNavigate(); // Function to programmatically change pages

  // --- 2. LOCAL STATE ---
  // Tracks if a user is currently authenticated
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // The name displayed in the profile link (e.g., "John")
  const [displayName, setDisplayName] = useState('User');
  
  // The user's permanent role ('learner' or 'trainer')
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // The user's current view mode. A 'trainer' can switch between their Coach dashboard and Athlete workout.
  const [activePersona, setActivePersona] = useState<'learner' | 'trainer'>('learner');

  /**
   * Sync Effect
   * Runs every time the user navigates to a new URL.
   * This ensures the Navbar always has the latest data from localStorage.
   */
  useEffect(() => {
    // Check if the login flag exists in the browser
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      // Priority: 1. Real Name from localStorage, 2. Email-derived username, 3. 'User'
      const storedName = localStorage.getItem('userName');
      const email = localStorage.getItem('userEmail') || '';
      const emailUsername = email.split('@')[0];
      
      const finalName = storedName || emailUsername || 'User';
      
      // Grab the permanent role and current active mode
      const role = localStorage.getItem('userRole');
      setUserRole(role);
      
      const persona = localStorage.getItem('activePersona') as 'learner' | 'trainer' || 'learner';
      setActivePersona(persona);

      // Capitalize first letter for a premium, professional feel
      setDisplayName(finalName.charAt(0).toUpperCase() + finalName.slice(1));
    }
  }, [location.pathname]); // Re-run whenever the route changes

  /**
   * Logout Handler
   * Clears all session data and redirects the user to the landing page.
   */
  const handleLogout = () => {
    // Wipe all security tokens and flags from the browser
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasProfile');
    localStorage.removeItem('hasTrainerProfile');
    
    // Reset local state and go home
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    // Sticky header with a modern "Glassmorphism" effect (blur + semi-transparent background)
    <nav className="sticky top-0 z-[80] w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* BRANDING / LOGO */}
        {/* If logged in, the logo takes you to Chat; otherwise, it takes you to the Landing Page */}
        <Link to={isLoggedIn ? ROUTES.CHAT : ROUTES.HOME} className="flex items-center gap-2.5 font-extrabold text-2xl text-slate-900 tracking-tight group">
          <div className="p-1.5 bg-orange-600 rounded-lg text-white group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-orange-600/20">
            <Dumbbell size={18} />
          </div>
          <span className="group-hover:text-orange-600 transition-colors">FitMate</span>
        </Link>
        
        <div className="flex items-center gap-8">
          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink to={ROUTES.HOME}>Home</NavLink>
            
            {/* CONDITIONAL DASHBOARD LINK: Show 'Dashboard' for coaches, 'Workout Plan' for athletes */}
            {activePersona === 'trainer' ? (
              <NavLink to={ROUTES.TRAINER_DASHBOARD}>Dashboard</NavLink>
            ) : (
              <NavLink 
                to={isLoggedIn ? ROUTES.WORKOUT : "#"} 
                onClick={(e) => {
                  // If a guest clicks 'Workout Plan', don't navigate; show the login modal instead
                  if (!isLoggedIn) {
                    e.preventDefault();
                    onLoginClick();
                  }
                }}
              >
                Workout Plan
              </NavLink>
            )}
            
            <NavLink to={ROUTES.TRAINERS}>Trainers</NavLink>
            
            {/* The AI Coach is only visible in Athlete mode */}
            {activePersona === 'learner' && (
              <NavLink 
                to={isLoggedIn ? ROUTES.CHAT : "#"}
                onClick={(e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    onLoginClick();
                  }
                }}
              >
                AI Coach
              </NavLink>
            )}
          </div>

          {/* Visual separator line */}
          <div className="h-6 w-px bg-slate-200 hidden lg:block" />

          {/* AUTHENTICATED SECTION */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              
              {/* 
                ROLE SWITCHER DROPDOWN
                Visible only for users who have unlocked the 'Trainer' persona.
                Allows them to toggle their view between 'Coach' and 'Athlete'.
              */}
              {(userRole === 'trainer' || activePersona === 'trainer' || localStorage.getItem('hasTrainerProfile') === 'true') && (
                <div className="relative flex items-center group">
                  <select 
                    value={activePersona}
                    onChange={(e) => {
                      const newPersona = e.target.value as 'learner' | 'trainer';
                      setActivePersona(newPersona);
                      localStorage.setItem('activePersona', newPersona);
                      
                      // We use window.location.href here for a hard refresh.
                      // This ensures all global states (like AI Context) are reset correctly for the new role.
                      window.location.href = newPersona === 'trainer' ? '/trainer/dashboard' : '/workout';
                    }}
                    className="pl-4 pr-10 py-2 bg-orange-50 border border-orange-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-600 appearance-none cursor-pointer hover:bg-orange-100 transition-all shadow-sm focus:outline-none"
                  >
                    <option value="learner">Athlete Mode</option>
                    <option value="trainer">Coach Mode</option>
                  </select>
                  {/* Custom arrow icon for the dropdown */}
                  <div className="absolute right-3 text-orange-400 pointer-events-none group-hover:text-orange-600 transition-colors">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              )}

              {/* USER PROFILE LINK */}
              <Link to={ROUTES.PROFILE} className="flex items-center gap-2.5 py-2 px-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 hover:bg-white hover:border-orange-200 transition-all shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-orange-500">
                  <FaUser size={10} />
                </div>
                <span className="text-sm">{displayName}</span>
              </Link>

              {/* LOGOUT BUTTON */}
              <button 
                onClick={handleLogout} 
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                aria-label="Logout"
              >
                <FaSignOutAlt size={18} />
              </button>
            </div>
          ) : (
            /* GUEST SECTION: Show Login/Signup buttons */
            <div className="flex items-center gap-4">
              <button 
                onClick={onLoginClick}
                className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-xl transition-all"
              >
                Log In
              </button>
              <button 
                onClick={onSignupClick}
                className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-600/20"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

/**
 * NavLink Helper Component
 * Standardizes the look of navigation links.
 */
const NavLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: (e: React.MouseEvent) => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors"
  >
    {children}
  </Link>
);

export default Navbar;
