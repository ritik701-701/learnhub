import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Star, PlayCircle, Users, CheckCircle, PlusCircle } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLesson, setNewLesson] = useState({ title: '', youtubeLink: '' });
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data: courseData } = await api.get(`/courses/${id}`);
        setCourse(courseData);
        
        // Try fetching lessons and user rating if user is logged in
        if (user) {
          try {
            const { data: lessonsData } = await api.get(`/lessons/${id}`);
            setLessons(lessonsData);
            
            // Only fetch rating if user is enrolled
            if (courseData.students.includes(user._id)) {
              const { data: ratingData } = await api.get(`/ratings/${id}/me`);
              setUserRating(ratingData.stars);
            }
          } catch (e) {
            // Probably not enrolled or not authorized
          }
        }
      } catch (error) {
        toast.error('Failed to load course details');
      }
      setLoading(false);
    };
    fetchDetails();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }
    
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success('Successfully enrolled!');
      // Refresh course data
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Enrollment failed');
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lessons', { ...newLesson, course: id });
      toast.success('Lesson added successfully!');
      setNewLesson({ title: '', youtubeLink: '' });
      // Refresh lessons
      const { data } = await api.get(`/lessons/${id}`);
      setLessons(data);
    } catch (error) {
      toast.error('Failed to add lesson');
    }
  };

  const handleRate = async (stars) => {
    try {
      await api.post('/ratings', { courseId: id, stars });
      setUserRating(stars);
      toast.success('Thanks for your rating!');
      
      // Refresh course to get new avgRating
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data);
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!course) return <div className="text-center p-10">Course not found</div>;

  const isEnrolled = user && course.students.includes(user._id);
  const isAdmin = user && course.admin && course.admin._id === user._id;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-indigo-600 dark:bg-indigo-900 rounded-2xl p-8 text-white mb-8 flex flex-col md:flex-row gap-8 items-center shadow-xl">
        <img src={course.thumbnail || 'https://via.placeholder.com/600x400'} alt={course.title} className="w-full md:w-1/2 rounded-xl shadow-lg object-cover h-64" />
        <div className="flex-1 space-y-4">
          <span className="px-3 py-1 bg-indigo-500 rounded-full text-sm font-semibold">{course.category}</span>
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <p className="text-indigo-100 text-lg line-clamp-3">{course.description}</p>
          <div className="flex items-center space-x-6 text-indigo-100">
            <span className="flex items-center"><Star className="w-5 h-5 text-yellow-400 mr-1 fill-current" /> {course.avgRating ? course.avgRating.toFixed(1) : 'New'}</span>
            <span className="flex items-center"><Users className="w-5 h-5 mr-1" /> {course.students.length} students</span>
          </div>
          <div className="pt-4">
            {isEnrolled || isAdmin ? (
              <Link to={`/course/${id}/lesson`} className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg">
                <PlayCircle className="w-5 h-5 mr-2" /> Go to Lessons
              </Link>
            ) : (
              <button onClick={handleEnroll} className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg text-lg">
                Enroll Now - {course.price === 0 ? 'Free' : `₹${course.price}`}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {(isEnrolled || isAdmin) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>
              {lessons.length === 0 ? (
                <p className="text-gray-500">No lessons available yet.</p>
              ) : (
                <ul className="space-y-3">
                  {lessons.map((lesson, idx) => (
                    <li key={lesson._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                      <div className="flex items-center">
                        <span className="text-gray-400 font-mono w-8">{idx + 1}.</span>
                        <span className="font-medium">{lesson.title}</span>
                      </div>
                      <CheckCircle className="text-gray-300 dark:text-gray-500 w-5 h-5" />
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex gap-4">
                <Link to={`/course/${id}/lesson`} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Start Learning →</Link>
                <Link to={`/course/${id}/assignments`} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">View Assignments →</Link>
                <Link to={`/course/${id}/quiz`} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Take Final Quiz →</Link>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800 flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-800 dark:text-indigo-200">
                  <PlusCircle className="mr-2 w-5 h-5" /> Add New Lesson
                </h2>
                <form onSubmit={handleAddLesson}>
                  <div className="flex flex-col gap-4 mb-4">
                    <input 
                      type="text" 
                      placeholder="Lesson Title" 
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" 
                      required 
                      value={newLesson.title}
                      onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                    />
                    
                    <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="checkbox" 
                        id="isLive" 
                        checked={newLesson.isLive || false}
                        onChange={e => setNewLesson({...newLesson, isLive: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <label htmlFor="isLive" className="text-sm font-medium text-gray-700 dark:text-gray-300">This is a Live Class</label>
                    </div>

                    {!newLesson.isLive ? (
                      <input 
                        type="url" 
                        placeholder="YouTube URL" 
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" 
                        required 
                        value={newLesson.youtubeLink || ''}
                        onChange={e => setNewLesson({...newLesson, youtubeLink: e.target.value})}
                      />
                    ) : (
                      <div className="flex flex-col md:flex-row gap-4">
                        <input 
                          type="datetime-local" 
                          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" 
                          required 
                          value={newLesson.liveDate || ''}
                          onChange={e => setNewLesson({...newLesson, liveDate: e.target.value})}
                        />
                        <input 
                          type="url" 
                          placeholder="Meeting Link (Zoom/Meet)" 
                          className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" 
                          required 
                          value={newLesson.liveMeetingLink || ''}
                          onChange={e => setNewLesson({...newLesson, liveMeetingLink: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                  <button type="submit" className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-md whitespace-nowrap">
                    Add Lesson
                  </button>
                </form>
              </div>
              <div className="border-t border-indigo-200 dark:border-indigo-800 pt-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">Course Assessment</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">Create or edit the final quiz for students to earn their certificate.</p>
                  </div>
                  <Link to={`/admin/course/${id}/quiz`} className="px-6 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg border border-indigo-200 dark:border-indigo-700 shadow-sm hover:shadow-md transition whitespace-nowrap">
                    Manage Final Quiz
                  </Link>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-indigo-100 dark:border-indigo-800 border-dashed">
                  <div>
                    <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">Assignments & Grading</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">Create assignments and grade student submissions.</p>
                  </div>
                  <Link to={`/admin/course/${id}/assignments`} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-sm hover:shadow-md hover:bg-indigo-700 transition whitespace-nowrap">
                    Manage Assignments
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rate Course Section (For Enrolled Students Only) */}
          {isEnrolled && !isAdmin && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <h3 className="font-bold text-lg mb-2">Rate this Course</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {userRating > 0 ? "You've rated this course:" : "How would you rate your experience?"}
              </p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= (hoverRating || userRating) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300 dark:text-gray-600'
                      } transition-colors`} 
                    />
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <p className="text-xs text-green-500 mt-3 font-medium">✓ Rating saved</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
