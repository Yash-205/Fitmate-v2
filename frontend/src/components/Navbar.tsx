import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaDumbbell, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={isLoggedIn ? "/chat" : "/"} className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <FaDumbbell size={24} />
          <span>FitMate</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <>
              <Link to="/chat" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">Coach</Link>
              <Link to="/workout" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">Workout Plan</Link>
              <div className="flex items-center gap-2 px-3 py-1.5 border rounded-full bg-slate-50 text-sm font-medium text-slate-700 ml-4">
                <FaUser size={12} className="text-slate-400" />
                <span>Sarah Martinez</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
                aria-label="Logout"
              >
                <FaSignOutAlt size={14} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
