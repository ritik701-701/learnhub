import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import { Book, Users, Star, PlusCircle } from 'lucide-react';

const InstructorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
        setStats(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        const status = err.response?.status;
        const msg = err.response?.data?.msg || err.message || 'Unknown error';
        setError(`Error ${status}: ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  if (!stats) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-red-500">Failed to load dashboard data</h2>
      {error && (
        <p className="mt-2 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 text-red-600 dark:text-red-400 font-mono">
          {error}
        </p>
      )}
      <p className="text-gray-500 mt-2">Please try refreshing the page.</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link to="/admin/create-course" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
          <PlusCircle className="w-5 h-5 mr-2" /> Create Course
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Courses" 
          value={stats.totalCourses} 
          icon={Book} 
          colorClass="bg-indigo-500" 
        />
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={Users} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="Top Rated Course" 
          value={stats.topCourse} 
          icon={Star} 
          colorClass="bg-yellow-500" 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Your Courses Statistics</h2>
        {stats.coursesStats && stats.coursesStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students Enrolled</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.coursesStats.map((c, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{c.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.students}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <Link to={`/admin/edit-course/${c._id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">You haven't created any courses yet.</p>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
