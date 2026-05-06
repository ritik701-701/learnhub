import { Link } from 'react-router-dom';
import { Book, LayoutDashboard, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-16 flex flex-col p-4 shadow-sm">
      <nav className="space-y-2 mt-4">
        <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          <Book className="w-5 h-5" />
          <span className="font-medium">All Courses</span>
        </Link>
        <Link to="/student" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link to="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
