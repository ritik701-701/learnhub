import { useState, useEffect } from 'react';
import api from '../api/axios';
import { BarChart, Activity } from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/instructor');
        setStats(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading analytics...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Activity className="mr-3 text-indigo-600 dark:text-indigo-400" /> Advanced Analytics
      </h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <BarChart className="mr-2 w-5 h-5" /> Course Enrollment Trends
        </h2>
        
        {/* Simple CSS-based bar chart representation */}
        <div className="space-y-4">
          {stats?.coursesStats?.map((course, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium dark:text-gray-300">{course.title}</span>
                <span className="text-sm font-medium dark:text-gray-300">{course.students} students</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div 
                  className="bg-indigo-600 h-4 rounded-full" 
                  style={{ width: `${Math.min((course.students / (stats.totalStudents || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
          {(!stats?.coursesStats || stats.coursesStats.length === 0) && (
            <p className="text-gray-500">Not enough data to display analytics.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
