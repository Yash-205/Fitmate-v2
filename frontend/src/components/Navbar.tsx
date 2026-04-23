import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

interface NavbarProps {
  onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState('User');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<'learner' | 'trainer'>('learner');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      const email = localStorage.getItem('userEmail') || '';
      const username = email.split('@')[0] || 'User';
      const role = localStorage.getItem('userRole');
      setUserRole(role);
      
      const persona = localStorage.getItem('activePersona') as 'learner' | 'trainer' || 'learner';
      setActivePersona(persona);

      // Capitalize first letter for premium feel
      setDisplayName(username.charAt(0).toUpperCase() + username.slice(1));
    }
  }, [location.pathname]);



  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasProfile');
    localStorage.removeItem('hasTrainerProfile');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-[80] w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to={isLoggedIn ? "/chat" : "/"} className="flex items-center gap-2.5 font-extrabold text-2xl text-slate-900 tracking-tight group">
          <div className="p-1.5 bg-orange-600 rounded-lg text-white group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-orange-600/20">
            <Dumbbell size={18} />
          </div>
          <span className="group-hover:text-orange-600 transition-colors">FitMate</span>
        </Link>
        
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-8">
            <NavLink to="/">Home</NavLink>
            {activePersona === 'trainer' ? (
              <NavLink to="/trainer/dashboard">Dashboard</NavLink>
            ) : (
              <NavLink 
                to={isLoggedIn ? "/workout" : "#"} 
                onClick={(e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    onLoginClick();
                  }
                }}
              >
                Workout Plan
              </NavLink>
            )}
            <NavLink to="/trainers">Trainers</NavLink>
            {activePersona === 'learner' && (
              <NavLink 
                to={isLoggedIn ? "/chat" : "#"}
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

          <div className="h-6 w-px bg-slate-200 hidden lg:block" />

          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              {/* 
                ROLE SWITCHER DROPDOWN
                Only visible if the user is a trainer. Allows toggling between 'Coach' and 'Athlete' personas.
                Uses window.location.href for a hard refresh to ensure all global states and route guards 
                are properly re-evaluated after a persona switch.
              */}
              {(userRole === 'trainer' || activePersona === 'trainer' || localStorage.getItem('hasTrainerProfile') === 'true') && (
                <div className="relative flex items-center group">
                  <select 
                    value={activePersona}
                    onChange={(e) => {
                      const newPersona = e.target.value as 'learner' | 'trainer';
                      setActivePersona(newPersona);
                      localStorage.setItem('activePersona', newPersona);
                      // Force a full reload to reset persona-specific UI across the app
                      window.location.href = newPersona === 'trainer' ? '/trainer/dashboard' : '/workout';
                    }}
                    className="pl-4 pr-10 py-2 bg-orange-50 border border-orange-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-600 appearance-none cursor-pointer hover:bg-orange-100 transition-all shadow-sm focus:outline-none"
                  >
                    <option value="learner">Athlete Mode</option>
                    <option value="trainer">Coach Mode</option>
                  </select>
                  <div className="absolute right-3 text-orange-400 pointer-events-none group-hover:text-orange-600 transition-colors">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              )}

              <Link to="/profile" className="flex items-center gap-2.5 py-2 px-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 hover:bg-white hover:border-orange-200 transition-all shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-orange-500">
                  <FaUser size={10} />
                </div>
                <span className="text-sm">{displayName}</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                aria-label="Logout"
              >
                <FaSignOutAlt size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={onLoginClick}
                className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-xl transition-all"
              >
                Log In
              </button>
              <button 
                onClick={onLoginClick}
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
