import { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import { BookOpen, CheckCircle, TrendingUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/student');
        setStats(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  if (!stats) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-red-500">Failed to load dashboard data</h2>
      <p className="text-gray-500">Please try refreshing the page.</p>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Enrolled Courses" 
          value={stats.enrolledCourses} 
          icon={BookOpen} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Completed Courses" 
          value={stats.completedCourses} 
          icon={CheckCircle} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="Average Progress" 
          value={`${stats.avgProgress}%`} 
          icon={TrendingUp} 
          colorClass="bg-purple-500" 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-yellow-100 font-bold uppercase tracking-wider text-sm mb-1">Total Points Earned</p>
            <h2 className="text-4xl font-black">{stats.points || 0}</h2>
            <p className="text-xs mt-2 opacity-80">Earn more points by completing lessons and assignments!</p>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <TrendingUp className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Your Badges</h2>
          {stats.badges && stats.badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {stats.badges.map((badge, idx) => (
                <span key={idx} className="px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full font-bold shadow-[0_4px_12px_rgba(168,85,247,0.4)] border border-white/20 flex items-center text-sm transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(168,85,247,0.6)] backdrop-blur-md cursor-default">
                  <Star className="w-4 h-4 mr-1.5 text-yellow-300 fill-current drop-shadow-sm" /> {badge}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No badges earned yet. Keep learning!</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Recent Courses</h2>
        {stats.recentCourses && stats.recentCourses.length > 0 ? (
          <div className="space-y-4">
            {stats.recentCourses.map(course => (
              <div key={course._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium">{course.title}</span>
                <Link to={`/course/${course._id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  Continue
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
