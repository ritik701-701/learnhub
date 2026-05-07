import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Moon, Sun, Bell, LogOut, BookOpen, Trophy, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="pt-4 px-4 pb-2 z-50 sticky top-0">
      <nav className="max-w-6xl mx-auto glass rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.4)] relative">
        <Link to="/" onClick={closeMenu} className="flex items-center space-x-2 text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" />
          <span>E-LearnHub</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2 md:space-x-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400 drop-shadow-md" /> : <Moon className="w-5 h-5 text-indigo-900 drop-shadow-md" />}
          </button>

          {user ? (
            <>
              <Link to="/leaderboard" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative" title="Global Leaderboard">
                <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-sm" />
              </Link>
              <Link to="/notifications" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative" title="Notifications">
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </Link>
              <Link to={user.role === 'admin' ? "/admin" : "/student"} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Login</Link>
              <Link to="/signup" className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile menu button and theme toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400 drop-shadow-md" /> : <Moon className="w-5 h-5 text-indigo-900 drop-shadow-md" />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col space-y-3 md:hidden">
            {user ? (
              <>
                <div className="flex justify-around py-2 border-b border-gray-100 dark:border-gray-700">
                  <Link to="/leaderboard" onClick={closeMenu} className="flex flex-col items-center p-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
                    <span className="text-xs font-semibold">Rankings</span>
                  </Link>
                  <Link to="/notifications" onClick={closeMenu} className="flex flex-col items-center p-2 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative">
                    <Bell className="w-5 h-5 mb-1" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-xs font-semibold">Alerts</span>
                  </Link>
                </div>
                <Link to={user.role === 'admin' ? "/admin" : "/student"} onClick={closeMenu} className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                  My Dashboard
                </Link>
                <button onClick={handleLogout} className="flex justify-center items-center px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all w-full">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/login" onClick={closeMenu} className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                  Login
                </Link>
                <Link to="/signup" onClick={closeMenu} className="px-4 py-3 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
