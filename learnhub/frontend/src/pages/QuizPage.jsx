import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Certificate from '../components/Certificate';
import { toast } from 'react-hot-toast';

const QuizPage = () => {
  const { id } = useParams(); // course id
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const [quizRes, attemptRes, courseRes, progressRes] = await Promise.all([
          api.get(`/quiz/${id}`).catch(() => ({ data: null })),
          api.get(`/quiz/result/${id}`).catch(() => ({ data: null })),
          api.get(`/courses/${id}`),
          api.get(`/progress/${id}`)
        ]);
        setQuiz(quizRes.data);
        setAttempt(attemptRes.data);
        setCourse(courseRes.data);
        setProgressPercent(progressRes.data.percent);
      } catch {
        toast.error('Failed to load quiz data');
      }
      setLoading(false);
    };

    fetchQuizData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error('Please answer all questions');
      return;
    }
    
    try {
      const { data } = await api.post('/quiz/attempt', {
        quizId: quiz._id,
        courseId: id,
        answers
      });
      setAttempt(data);
      toast.success('Quiz submitted successfully!');
    } catch {
      toast.error('Submission failed');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading quiz...</div>;

  if (!quiz) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold mb-4">No Quiz Available</h2>
        <p className="text-gray-500">The admin has not added a quiz for this course yet.</p>
        <button onClick={() => navigate(`/course/${id}`)} className="mt-4 text-indigo-600 hover:underline">Back to Course</button>
      </div>
    );
  }

  // If already attempted
  if (attempt) {
    const isEligibleForCert = attempt.passed && progressPercent === 100;

    return (
      <div className="max-w-4xl mx-auto">
        <div className={`p-8 rounded-xl shadow-md mb-8 ${attempt.passed ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
          <h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
          <p className="text-xl mb-2">Score: <span className="font-bold">{attempt.score.toFixed(1)}%</span></p>
          <p className="text-lg">Status: <span className={`font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>{attempt.passed ? 'PASSED' : 'FAILED'}</span></p>
          <p className="text-sm mt-4 text-gray-600 dark:text-gray-400">Passing requirement: {quiz.passingPercent}%</p>
        </div>

        {isEligibleForCert ? (
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">Congratulations! Here is your Certificate</h2>
            <Certificate 
              userName={user?.name || 'Student'} 
              courseName={course?.title || 'Course'} 
              date={new Date(attempt.createdAt).toLocaleDateString()} 
            />
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Certificate Eligibility</h3>
            <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
              <li>Pass the quiz (Current: {attempt.passed ? 'Yes' : 'No'})</li>
              <li>Complete 100% of lessons (Current: {progressPercent.toFixed(0)}%)</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h1 className="text-3xl font-bold mb-6">Final Assessment</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">Passing Grade: {quiz.passingPercent}% | Questions: {quiz.questions.length}</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {quiz.questions.map((q, index) => (
          <div key={q._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="font-semibold text-lg mb-4">{index + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${q._id}`}
                    value={opt}
                    onChange={() => setAnswers({ ...answers, [q._id]: opt })}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-md hover:bg-indigo-700 transition">
          Submit Quiz
        </button>
      </form>
    </div>
  );
};

export default QuizPage;
