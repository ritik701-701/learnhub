import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowLeft, FileText, CheckCircle, Upload } from 'lucide-react';

const StudentAssignments = () => {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [answerTexts, setAnswerTexts] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchCourseAndAssignments = useCallback(async () => {
    try {
      const [courseRes, assignRes, subRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/assignments/course/${id}`),
        api.get(`/assignments/my-submissions/${id}`)
      ]);
      setCourse(courseRes.data);
      setAssignments(assignRes.data);
      setMySubmissions(subRes.data);
    } catch {
      toast.error('Failed to load assignments');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchCourseAndAssignments();
  }, [fetchCourseAndAssignments]);

  const handleSubmitAssignment = async (assignmentId) => {
    const text = answerTexts[assignmentId];
    if (!text || !text.trim()) return toast.error('Please enter your answer');
    
    try {
      await api.post('/assignments/submit', {
        assignmentId,
        courseId: id,
        answerText: text
      });
      toast.success('Assignment submitted successfully!');
      fetchCourseAndAssignments(); // Refresh submissions
    } catch {
      toast.error('Submission failed');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading assignments...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <button 
        onClick={() => navigate(`/course/${id}`)}
        className="flex items-center text-indigo-600 mb-6 hover:underline font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
      </button>

      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <FileText className="mr-3 text-indigo-600 w-8 h-8" /> Course Assignments
      </h1>
      <p className="text-gray-500 mb-8">Complete these assignments for {course?.title}</p>
      
      {assignments.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-500">No assignments have been posted for this course yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {assignments.map((a, index) => {
            const sub = mySubmissions.find(s => s.assignment === a._id);
            return (
              <div key={a._id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Assignment {index + 1}: {a.title}</h3>
                    {a.dueDate && <p className="text-sm text-gray-500 mt-1">Due: {new Date(a.dueDate).toLocaleDateString()}</p>}
                  </div>
                  {sub?.grade ? (
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className={`px-3 py-1 font-bold rounded-full text-sm flex items-center ${
                        ['A','B','C'].includes(sub.grade)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Grade: {sub.grade}
                      </span>
                      <span className={`px-2 py-1 font-bold rounded-full text-xs text-white ${sub.passed ? 'bg-green-500' : 'bg-red-500'}`}>
                        {sub.passed ? '✓ PASS' : '✗ FAIL'}
                      </span>
                    </div>
                  ) : sub ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 font-bold rounded-full text-sm flex items-center">
                      <Upload className="w-4 h-4 mr-1" /> Submitted
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-bold rounded-full text-sm">
                      Pending
                    </span>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="mb-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-lg">
                    {a.description}
                  </div>
                  
                  {sub ? (
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-lg border border-indigo-100 dark:border-indigo-800">
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">Your Submission</h4>
                      <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 whitespace-pre-wrap mb-4">
                        {sub.answerText}
                      </p>
                      
                      {sub.feedback && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md border-l-4 border-blue-500">
                          <h5 className="font-bold text-blue-900 dark:text-blue-200 mb-1">Admin Feedback</h5>
                          <p className="text-blue-800 dark:text-blue-300">{sub.feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        placeholder="Write your answer here..."
                        rows="6"
                        value={answerTexts[a._id] || ''}
                        onChange={(e) => setAnswerTexts({...answerTexts, [a._id]: e.target.value})}
                        className="w-full p-4 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                      ></textarea>
                      <button
                        onClick={() => handleSubmitAssignment(a._id)}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition flex items-center shadow-md"
                      >
                        <Upload className="w-5 h-5 mr-2" /> Submit Assignment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
