import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import SearchBar from '../components/SearchBar';
import { BookOpen } from 'lucide-react';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState('');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      let query = `?search=${search}`;
      if (category) query += `&category=${category}`;
      if (rating) query += `&rating=${rating}`;
      
      const { data } = await api.get(`/courses${query}`);
      setCourses(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, [search, category, rating]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);


  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold flex items-center">
          <BookOpen className="mr-2 text-indigo-600 dark:text-indigo-400" /> All Courses
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <SearchBar onSearch={setSearch} />
          <select 
            className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="web">Web Development</option>
            <option value="data">Data Science</option>
            <option value="design">Design</option>
          </select>
          <select 
            className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">No courses found</h2>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
