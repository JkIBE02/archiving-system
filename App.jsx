import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import SchoolYearSelection from './pages/SchoolYearSelection';
import SemesterSelection from './pages/SemesterSelection';
import SectionSelection from './pages/SectionSelection';
import DocumentView from './pages/DocumentView';
import ExamView from './pages/ExamView';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import Calendar from './pages/Calendar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/school-year" element={<PrivateRoute><SchoolYearSelection /></PrivateRoute>} />
        <Route path="/semester" element={<PrivateRoute><SemesterSelection /></PrivateRoute>} />
        <Route path="/section" element={<PrivateRoute><SectionSelection /></PrivateRoute>} />
        <Route path="/document/:sectionId" element={<PrivateRoute><DocumentView /></PrivateRoute>} />
        <Route path="/exam/:examType" element={<PrivateRoute><ExamView /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
