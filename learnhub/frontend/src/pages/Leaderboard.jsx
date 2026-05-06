import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trophy, Medal, Star } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/leaderboard');
        setLeaders(data);
      } catch (error) {
        console.error('Error fetching leaderboard', error);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading leaderboard...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-900 dark:text-indigo-100 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-yellow-500 mr-3" /> Global Leaderboard
        </h1>
        <p className="text-gray-500 mt-2">Top students across the platform based on earned points.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        {leaders.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No students on the leaderboard yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaders.map((student, idx) => (
              <li key={student._id} className={`p-6 flex items-center justify-between ${idx === 0 ? 'bg-yellow-50 dark:bg-yellow-900/10' : idx === 1 ? 'bg-gray-50 dark:bg-gray-700/30' : idx === 2 ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                <div className="flex items-center">
                  <div className="w-12 h-12 flex items-center justify-center font-bold text-xl mr-4">
                    {idx === 0 ? <Medal className="w-10 h-10 text-yellow-500" /> : idx === 1 ? <Medal className="w-8 h-8 text-gray-400" /> : idx === 2 ? <Medal className="w-8 h-8 text-orange-500" /> : <span className="text-gray-400">#{idx + 1}</span>}
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xl uppercase mr-4">
                    {student.avatar ? <img src={student.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" /> : student.name.charAt(0)}
                  </div>
                  
                  <div>
                    <h3 className={`font-bold text-lg ${idx === 0 ? 'text-yellow-700 dark:text-yellow-500' : 'text-gray-800 dark:text-gray-200'}`}>
                      {student.name}
                    </h3>
                    {student.badges && student.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {student.badges.map((badge, bIdx) => (
                          <span key={bIdx} className="text-xs px-3 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)] border border-white/20 flex items-center transform transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] backdrop-blur-sm cursor-default">
                            <Star className="w-3 h-3 mr-1 text-yellow-300 fill-current drop-shadow-sm" /> {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                    {student.points || 0}
                  </div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Points</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
