import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';


import Login from './pages/Login';
import Signup from './pages/Signup';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import InstructorQuiz from './pages/InstructorQuiz';
import InstructorAssignments from './pages/InstructorAssignments';
import StudentAssignments from './pages/StudentAssignments';
import LessonView from './pages/LessonView';
import QuizPage from './pages/QuizPage';
import Notifications from './pages/Notifications';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<CourseList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/student" element={
              <PrivateRoute role="student"><StudentDashboard /></PrivateRoute>
            } />
            <Route path="/course/:id/lesson" element={
              <PrivateRoute><LessonView /></PrivateRoute>
            } />
            <Route path="/course/:id/quiz" element={
              <PrivateRoute><QuizPage /></PrivateRoute>
            } />
            <Route path="/course/:id/assignments" element={
              <PrivateRoute><StudentAssignments /></PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <PrivateRoute role="admin"><InstructorDashboard /></PrivateRoute>
            } />
            <Route path="/admin/create-course" element={
              <PrivateRoute role="admin"><CreateCourse /></PrivateRoute>
            } />
            <Route path="/admin/edit-course/:id" element={
              <PrivateRoute role="admin"><EditCourse /></PrivateRoute>
            } />
            <Route path="/admin/course/:id/quiz" element={
              <PrivateRoute role="admin"><InstructorQuiz /></PrivateRoute>
            } />
            <Route path="/admin/course/:id/assignments" element={
              <PrivateRoute role="admin"><InstructorAssignments /></PrivateRoute>
            } />
            
            <Route path="/notifications" element={
              <PrivateRoute><Notifications /></PrivateRoute>
            } />
            <Route path="/leaderboard" element={
              <PrivateRoute><Leaderboard /></PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
