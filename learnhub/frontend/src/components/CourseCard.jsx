import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden group relative flex flex-col h-full">
      {/* Thumbnail with overlay */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        
        {/* Play button appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
          <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            <Play className="w-6 h-6 text-white ml-1 fill-current" />
          </div>
        </div>

        <div className="absolute top-3 left-3">
          <span className="text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full border border-white/30 shadow-sm uppercase tracking-wide">
            {course.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-yellow-400 bg-yellow-400/10 dark:bg-yellow-400/20 px-2 py-1 rounded-md text-sm font-bold">
            <Star className="w-4 h-4 fill-current mr-1" />
            {course.avgRating ? course.avgRating.toFixed(1) : 'New'}
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {course.students?.length || 0} enrolled
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">
          {course.description}
        </p>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-auto">
          <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {course.price === 0 ? 'Free' : `₹${course.price}`}
          </span>
          <Link 
            to={`/course/${course._id}`} 
            className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 transition-all duration-300"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
