import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Bell, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {
      toast.error('Failed to load notifications');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Bell className="mr-2 text-indigo-600 dark:text-indigo-400" /> Notifications
        </h1>
        <button 
          onClick={markAllRead}
          className="text-sm px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No notifications yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map(n => (
              <li key={n._id} className={`p-4 flex items-start ${n.read ? 'bg-transparent' : 'bg-indigo-50 dark:bg-indigo-900/20'}`}>
                <CheckCircle className={`w-5 h-5 mr-3 mt-0.5 ${n.read ? 'text-gray-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                <div>
                  <p className={`text-sm ${n.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-semibold'}`}>
                    {n.message}
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
