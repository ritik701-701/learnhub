import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, FileText, CheckCircle, XCircle } from 'lucide-react';

const InstructorAssignments = () => {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  const fetchAssignments = useCallback(async () => {
    try {
      const { data } = await api.get(`/assignments/course/${id}`);
      setAssignments(data);
    } catch {
      toast.error('Failed to load assignments');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', { ...newAssignment, course: id });
      toast.success('Assignment created!');
      setNewAssignment({ title: '', description: '', dueDate: '' });
      setShowCreate(false);
      fetchAssignments();
    } catch {
      toast.error('Failed to create assignment');
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(data);
      setSelectedAssignment(assignmentId);
    } catch {
      toast.error('Failed to load submissions');
    }
  };

  const handleGrade = async (submissionId) => {
    if (!gradeData.grade) return toast.error('Please enter a grade');
    try {
      await api.post(`/assignments/grade/${submissionId}`, gradeData);
      toast.success('Graded successfully');
      setGradeData({ grade: '', feedback: '' });
      fetchSubmissions(selectedAssignment);
    } catch {
      toast.error('Failed to grade');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <button 
        onClick={() => navigate(`/course/${id}`)}
        className="flex items-center text-indigo-600 mb-6 hover:underline font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center"><FileText className="mr-3 text-indigo-600" /> Manage Assignments</h1>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
        >
          {showCreate ? 'Cancel' : <><Plus className="w-4 h-4 mr-1" /> Create Assignment</>}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateAssignment} className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <h2 className="font-bold text-lg mb-4 text-indigo-900 dark:text-indigo-100">New Assignment</h2>
          <div className="space-y-4">
            <input 
              type="text" placeholder="Assignment Title" required
              value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
              className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <textarea 
              placeholder="Description / Instructions" required rows="3"
              value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
              className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            ></textarea>
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">Due Date (Optional)</label>
              <input 
                type="date"
                value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                className="p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Save Assignment</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-3 border-r pr-4 dark:border-gray-700">
          <h2 className="font-bold text-lg mb-4 border-b pb-2 dark:border-gray-700">Course Assignments</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-sm">No assignments created yet.</p>
          ) : (
            assignments.map(a => (
              <div 
                key={a._id} 
                onClick={() => fetchSubmissions(a._id)}
                className={`p-4 rounded-lg cursor-pointer transition border ${selectedAssignment === a._id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <h3 className="font-semibold truncate">{a.title}</h3>
                {a.dueDate && <p className="text-xs text-gray-500 mt-1">Due: {new Date(a.dueDate).toLocaleDateString()}</p>}
              </div>
            ))
          )}
        </div>

        <div className="md:col-span-2 pl-2">
          {selectedAssignment ? (
            <div>
              <h2 className="font-bold text-xl mb-4 border-b pb-2 dark:border-gray-700">Student Submissions</h2>
              {submissions.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-gray-500">No submissions yet for this assignment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map(sub => (
                    <div key={sub._id} className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-lg">{sub.user.name}</p>
                          <p className="text-xs text-gray-500">{new Date(sub.createdAt).toLocaleString()}</p>
                        </div>
                        {sub.grade ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-bold rounded-full text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" /> Graded: {sub.grade}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 font-bold rounded-full text-sm flex items-center">
                            <XCircle className="w-4 h-4 mr-1" /> Needs Grading
                          </span>
                        )}
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg mb-4 text-sm whitespace-pre-wrap border border-gray-100 dark:border-gray-700">
                        {sub.answerText}
                      </div>

                      {!sub.grade ? (
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                          <div className="flex gap-3 mb-3">
                            <input 
                              type="text" placeholder="Grade (e.g. A, 9/10, 85%)" 
                              onChange={e => setGradeData({...gradeData, grade: e.target.value})}
                              className="w-1/3 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 outline-none"
                            />
                            <input 
                              type="text" placeholder="Feedback (Optional)" 
                              onChange={e => setGradeData({...gradeData, feedback: e.target.value})}
                              className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 outline-none"
                            />
                          </div>
                          <button onClick={() => handleGrade(sub._id)} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700">
                            Submit Grade
                          </button>
                        </div>
                      ) : (
                        sub.feedback && (
                          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-800 dark:text-blue-200 border-l-4 border-blue-400">
                            <strong>Your Feedback:</strong> {sub.feedback}
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select an assignment to view submissions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorAssignments;
