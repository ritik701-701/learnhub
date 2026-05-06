import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { PlusCircle, Trash2, Save, ArrowLeft } from 'lucide-react';

const InstructorQuiz = () => {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [passingPercent, setPassingPercent] = useState(70);
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }
  ]);

  const fetchQuiz = useCallback(async () => {
    try {
      const { data } = await api.get(`/quiz/${id}`);
      if (data) {
        setQuestions(data.questions);
        setPassingPercent(data.passingPercent);
      }
    } catch {
      // If 404, it means no quiz yet, which is fine.
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    const newQs = [...questions];
    newQs.splice(index, 1);
    setQuestions(newQs);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQs = [...questions];
    newQs[qIndex].options[oIndex] = value;
    setQuestions(newQs);
  };

  const handleSave = async () => {
    // Basic validation
    for (const q of questions) {
      if (!q.question.trim() || q.options.some(o => !o.trim()) || !q.correctAnswer.trim()) {
        toast.error('Please fill all fields and set correct answers for all questions.');
        return;
      }
      if (!q.options.includes(q.correctAnswer)) {
        toast.error(`Correct answer for "${q.question}" must match one of its options exactly.`);
        return;
      }
    }

    try {
      await api.post('/quiz/create', {
        course: id,
        questions,
        passingPercent
      });
      toast.success('Quiz saved successfully!');
      navigate(`/course/${id}`);
    } catch {
      toast.error('Failed to save quiz');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <button 
        onClick={() => navigate(`/course/${id}`)}
        className="flex items-center text-indigo-600 mb-6 hover:underline font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
      </button>

      <h1 className="text-3xl font-bold mb-6">Manage Final Quiz</h1>
      
      <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <label className="block text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-2">
          Passing Percentage Required for Certificate
        </label>
        <div className="flex items-center gap-3">
          <input 
            type="number" 
            min="1" max="100" 
            value={passingPercent}
            onChange={(e) => setPassingPercent(Number(e.target.value))}
            className="w-24 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-lg text-indigo-700 dark:text-indigo-300"
          />
          <span className="text-lg font-bold text-indigo-900 dark:text-indigo-200">%</span>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 relative">
            <button 
              onClick={() => handleRemoveQuestion(qIndex)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition"
              title="Remove Question"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Question {qIndex + 1}</h3>
            
            <input 
              type="text"
              placeholder="Enter question text..."
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {q.options.map((opt, oIndex) => (
                <input 
                  key={oIndex}
                  type="text"
                  placeholder={`Option ${oIndex + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  className={`w-full p-3 border rounded-lg dark:bg-gray-800 outline-none transition-all ${
                    q.correctAnswer && q.correctAnswer === opt && opt.trim() !== ''
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'dark:border-gray-600 focus:ring-2 focus:ring-indigo-500'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-gray-200 dark:border-gray-600 pt-4 mt-2">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Correct Answer</label>
                <select 
                  value={q.correctAnswer}
                  onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="" disabled>Select correct option...</option>
                  {q.options.filter(o => o.trim() !== '').map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Marks</label>
                <input 
                  type="number"
                  min="1"
                  value={q.marks}
                  onChange={(e) => handleQuestionChange(qIndex, 'marks', Number(e.target.value))}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button 
          onClick={handleAddQuestion}
          className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center border border-gray-300 dark:border-gray-600 border-dashed"
        >
          <PlusCircle className="mr-2 w-5 h-5" /> Add New Question
        </button>
        <button 
          onClick={handleSave}
          className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg flex items-center justify-center"
        >
          <Save className="mr-2 w-5 h-5" /> Save Entire Quiz
        </button>
      </div>
    </div>
  );
};

export default InstructorQuiz;
