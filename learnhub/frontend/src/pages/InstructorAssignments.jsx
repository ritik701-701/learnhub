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
    if (!gradeData.grade) return toast.error('Please select a grade');
    try {
      await api.post(`/assignments/grade/${submissionId}`, gradeData);
      toast.success('Graded successfully');
      setGradeData({ grade: '', feedback: '' });
      fetchSubmissions(selectedAssignment);
    } catch {
      toast.error('Failed to grade');
    }
  };

  // Helper: grade color + pass/fail
  const getGradeInfo = (grade) => {
    const map = {
      A: { color: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400', label: 'PASS' },
      B: { color: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', label: 'PASS' },
      C: { color: 'text-indigo-700 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400', label: 'PASS' },
      D: { color: 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400', label: 'FAIL' },
      F: { color: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400', label: 'FAIL' },
    };
    return map[grade] || { color: 'text-gray-600 bg-gray-100', label: '' };
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
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 font-bold rounded-full text-sm flex items-center ${getGradeInfo(sub.grade).color}`}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Grade: {sub.grade}
                            </span>
                            <span className={`px-2 py-1 font-bold rounded-full text-xs ${sub.passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                              {sub.passed ? '✓ PASS' : '✗ FAIL'}
                            </span>
                          </div>
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
                          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-3 uppercase tracking-wider">Grade this submission (C or above = Pass)</p>
                          <div className="flex gap-3 mb-3">
                            <select
                              value={gradeData.grade}
                              onChange={e => setGradeData({...gradeData, grade: e.target.value})}
                              className="w-1/3 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 outline-none font-bold"
                            >
                              <option value="">Select Grade</option>
                              <option value="A">A — Excellent (Pass)</option>
                              <option value="B">B — Good (Pass)</option>
                              <option value="C">C — Average (Pass)</option>
                              <option value="D">D — Below Average (Fail)</option>
                              <option value="F">F — Fail</option>
                            </select>
                            <input 
                              type="text" placeholder="Feedback for student (Optional)" 
                              value={gradeData.feedback}
                              onChange={e => setGradeData({...gradeData, feedback: e.target.value})}
                              className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 outline-none"
                            />
                          </div>
                          {gradeData.grade && (
                            <p className={`text-xs font-bold mb-2 ${['A','B','C'].includes(gradeData.grade) ? 'text-green-600' : 'text-red-600'}`}>
                              {['A','B','C'].includes(gradeData.grade) ? '✓ This grade will PASS the student' : '✗ This grade will FAIL the student'}
                            </p>
                          )}
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
