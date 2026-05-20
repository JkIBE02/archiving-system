import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaCog, FaSignOutAlt, FaHome } from 'react-icons/fa';

const FacultyNavigation = ({ user, showBackToHome = false }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-3">
      {showBackToHome && (
        <button
          onClick={() => navigate('/school-year')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition font-medium"
          title="Back to Home"
        >
          <FaHome />
          <span className="hidden sm:inline">Home</span>
        </button>
      )}
      
      <button
        onClick={() => navigate('/calendar')}
        className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition font-medium"
        title="View Calendar"
      >
        <FaCalendar />
        <span className="hidden sm:inline">Calendar</span>
      </button>
      
      <button
        onClick={() => navigate('/settings')}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-medium"
        title="Settings"
      >
        <FaCog />
        <span className="hidden sm:inline">Settings</span>
      </button>
      
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
        title="Logout"
      >
        <FaSignOutAlt />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
};

export default FacultyNavigation;
