import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Moon, Sun, Bell, LogOut, BookOpen, Trophy } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="pt-6 px-4 pb-2 z-50 sticky top-0">
      <nav className="max-w-6xl mx-auto glass rounded-full px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.4)]">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <span>E-LearnHub</span>
        </Link>
        
        <div className="flex items-center space-x-2 md:space-x-4">
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
      </nav>
    </div>
  );
};

export default Navbar;
