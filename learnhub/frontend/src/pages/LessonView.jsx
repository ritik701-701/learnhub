import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { CheckCircle, Circle, PlayCircle, MessageSquare, Award, X } from 'lucide-react';
import Certificate from '../components/Certificate';

const LessonView = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState({ completedLessons: [] });
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const { user } = useContext(AuthContext);

  // AI Chat State
  const [activeTab, setActiveTab] = useState('qa'); // 'qa', 'ai', or 'notes'
  const [chatHistory, setChatHistory] = useState([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Notes State
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  const fetchLessonsAndProgress = useCallback(async () => {
    try {
      const [courseRes, lessonsRes, progressRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/lessons/${id}`),
        api.get(`/progress/${id}`)
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      setProgress(progressRes.data.progress || { completedLessons: [] });
      setPercent(progressRes.data.percent || 0);
      if (lessonsRes.data.length > 0) setCurrentLesson(lessonsRes.data[0]);
    } catch {
      toast.error('Error loading lessons');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchLessonsAndProgress();
  }, [fetchLessonsAndProgress]);

  const fetchNotes = useCallback(async () => {
    if (!currentLesson) return;
    try {
      const { data } = await api.get(`/notes/${currentLesson._id}`);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes', error);
    }
  }, [currentLesson]);

  const fetchComments = useCallback(async () => {
    if (!currentLesson) return;
    try {
      const { data } = await api.get(`/comments/${currentLesson._id}`);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments', error);
    }
  }, [currentLesson]);

  useEffect(() => {
    if (currentLesson) {
      fetchComments();
      fetchNotes();
      setChatHistory([]); // Reset chat history when changing lessons
    }
  }, [currentLesson, fetchComments, fetchNotes]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.post('/notes', { lesson: currentLesson._id, text: newNote });
      setNewNote('');
      fetchNotes();
      toast.success('Note saved!');
    } catch {
      toast.error('Failed to save note');
    }
  };

  const handleComplete = async () => {
    try {
      await api.post('/progress/complete', { courseId: id, lessonId: currentLesson._id });
      toast.success('Lesson marked as complete!');
      fetchLessonsAndProgress(); // Refresh progress
    } catch {
      toast.error('Failed to update progress');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post('/comments', { lesson: currentLesson._id, text: newComment });
      setNewComment('');
      fetchComments();
      toast.success('Doubt posted successfully');
    } catch {
      toast.error('Failed to post doubt');
    }
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const userMessage = { role: 'user', content: aiQuestion };
    setChatHistory([...chatHistory, userMessage]);
    setAiQuestion('');
    setAiLoading(true);

    try {
      const { data } = await api.post('/ai/ask', {
        question: userMessage.content,
        context: `The student is currently watching a lesson titled "${currentLesson.title}" from the course "${course.title}".`
      });
      
      setChatHistory(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch {
      toast.error('AI Tutor is currently unavailable');
    }
    setAiLoading(false);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      fetchNotes();
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) return <div className="p-10 text-center">Loading course data...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 relative">
      {/* Sidebar for Navigation */}
      <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 h-fit">
        <h2 className="text-xl font-bold mb-4">Course Progress</h2>
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
          </div>
          <p className="text-xs text-right mt-1 text-gray-500">{percent.toFixed(0)}% Complete</p>
          
          {percent === 100 && (
            <button 
              onClick={() => setShowCertificate(true)}
              className="w-full mt-4 flex items-center justify-center py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg font-bold shadow-md hover:from-yellow-500 hover:to-yellow-700 transition"
            >
              <Award className="w-5 h-5 mr-2" /> Get Certificate
            </button>
          )}
        </div>

        <h3 className="font-bold text-sm text-gray-500 mb-2">COURSE LESSONS</h3>
        <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {lessons.map((lesson, index) => {
            const isCompleted = progress.completedLessons.includes(lesson._id);
            const isActive = currentLesson && currentLesson._id === lesson._id;
            return (
              <li key={lesson._id}>
                <button
                  onClick={() => setCurrentLesson(lesson)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <div className="flex items-center">
                    <PlayCircle className={`w-4 h-4 mr-2 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isActive ? 'font-semibold text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'} truncate max-w-[150px]`}>
                      {index + 1}. {lesson.title}
                    </span>
                  </div>
                  {isCompleted ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="w-full md:w-3/4 space-y-6">
        {currentLesson ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="aspect-video w-full bg-black relative">
                {currentLesson.isLive ? (
                  <div className="flex flex-col items-center justify-center h-full text-white bg-gradient-to-b from-indigo-900 to-black p-8">
                    <div className="w-16 h-16 bg-red-500 rounded-full animate-pulse flex items-center justify-center mb-4">
                      <span className="font-bold text-white tracking-widest text-sm">LIVE</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-center">Live Session Scheduled</h3>
                    {currentLesson.liveDate && (
                      <p className="text-indigo-200 mb-6 text-lg">
                        {new Date(currentLesson.liveDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                      </p>
                    )}
                    {currentLesson.liveMeetingLink ? (
                      <a 
                        href={currentLesson.liveMeetingLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-[0_0_15px_rgba(79,70,229,0.5)] flex items-center"
                      >
                        <PlayCircle className="w-5 h-5 mr-2" /> Join Live Class
                      </a>
                    ) : (
                      <p className="text-gray-400 italic">Meeting link will be provided soon.</p>
                    )}
                  </div>
                ) : getEmbedUrl(currentLesson.youtubeLink) ? (
                  <iframe
                    className="w-full h-full"
                    src={getEmbedUrl(currentLesson.youtubeLink)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">Invalid Video Link</div>
                )}
              </div>
              <div className="p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                <button
                  onClick={handleComplete}
                  disabled={progress.completedLessons.includes(currentLesson._id)}
                  className={`px-4 py-2 rounded-md font-medium transition ${progress.completedLessons.includes(currentLesson._id) ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  {progress.completedLessons.includes(currentLesson._id) ? 'Completed ✓' : 'Mark as Complete'}
                </button>
              </div>
            </div>

            {/* Interactive Tabs Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 border-t-4 border-t-indigo-500">
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button 
                  onClick={() => setActiveTab('qa')}
                  className={`px-4 py-2 font-bold text-sm focus:outline-none flex items-center ${activeTab === 'qa' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Community Q&A
                </button>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={`px-4 py-2 font-bold text-sm focus:outline-none flex items-center ${activeTab === 'ai' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  <span className="text-xl mr-2">🤖</span> Ask AI Tutor
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 font-bold text-sm focus:outline-none flex items-center ${activeTab === 'notes' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  <span className="text-xl mr-2">📝</span> My Notes
                </button>
              </div>
              
              {activeTab === 'qa' ? (
                <>
                  <form onSubmit={handleAddComment} className="mb-6">
                    <textarea
                      className="w-full p-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-sm"
                      rows="3"
                      placeholder="Ask a doubt about this lesson to the community..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    ></textarea>
                    <div className="flex justify-end">
                      <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm">
                        Post Comment
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to ask!</p>
                      </div>
                    ) : (
                      comments.map(c => (
                        <div key={c._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 flex items-center justify-center font-bold text-sm uppercase">
                              {c.user.name.charAt(0)}
                            </div>
                            <p className="font-semibold text-sm">{c.user.name}</p>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 ml-10">{c.text}</p>
                          
                          {c.reply && (
                            <div className="mt-4 ml-10 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border-l-4 border-indigo-400">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded uppercase">Admin Reply</span>
                              </div>
                              <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{c.reply}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : activeTab === 'ai' ? (
                <div className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4 border border-gray-200 dark:border-gray-700 custom-scrollbar">
                    {chatHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                        <span className="text-5xl mb-4">🤖</span>
                        <p className="font-bold text-lg mb-2">Hi, I'm your AI Tutor!</p>
                        <p className="text-sm max-w-sm">Got a question about this lesson? Ask me anything and I'll help you understand it using ChatGPT.</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap'}`}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleAskAI} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700"
                      placeholder="Type your question..."
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      disabled={aiLoading}
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={aiLoading}
                      className="px-6 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition"
                    >
                      Ask
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col h-[400px]">
                  <form onSubmit={handleAddNote} className="mb-4">
                    <div className="flex gap-2">
                      <textarea
                        className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-sm"
                        rows="2"
                        placeholder="Write a personal note for this lesson..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        required
                      ></textarea>
                      <button type="submit" className="px-6 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm">
                        Save Note
                      </button>
                    </div>
                  </form>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {notes.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <span className="text-4xl block mb-2">📝</span>
                        No notes yet. Add your first note above!
                      </div>
                    ) : (
                      notes.map(note => (
                        <div key={note._id} className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/50 shadow-sm relative group">
                          <p className="text-gray-800 dark:text-gray-200 pr-8">{note.text}</p>
                          <p className="text-xs text-gray-400 mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                          <button 
                            onClick={() => handleDeleteNote(note._id)}
                            className="absolute top-3 right-3 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                            title="Delete note"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500">Select a lesson to start learning.</p>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificate && course && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden animate-fade-in relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Your Certificate</h2>
              <button 
                onClick={() => setShowCertificate(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow flex items-center justify-center bg-gray-50">
              <Certificate 
                userName={user?.name || 'Student'} 
                courseName={course.title} 
                date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonView;
