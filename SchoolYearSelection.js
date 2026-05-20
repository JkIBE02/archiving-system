import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolYearAPI } from '../services/api';
import { FaCalendarAlt, FaSignOutAlt, FaArrowRight, FaCog, FaCalendar, FaUser } from 'react-icons/fa';

const SchoolYearSelection = () => {
  const [schoolYears, setSchoolYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  const fetchSchoolYears = async () => {
    try {
      const { data } = await schoolYearAPI.getAll();
      setSchoolYears(data.schoolYears || []);
    } catch (err) {
      console.error('Error fetching school years:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (year) => {
    sessionStorage.setItem('selectedSchoolYear', year);
    navigate('/semester');
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - ✅ Made Sticky */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              {/* Faculty Profile Picture */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-indigo-500">
                {user.profilePicture ? (
                  <img 
                    src={`http://localhost:5000${user.profilePicture}`} 
                    alt={user.firstName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <FaUser className={`text-2xl text-gray-400 ${user.profilePicture ? 'hidden' : ''}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Select School Year</h1>
                <p className="text-sm text-gray-600">Welcome, {user.firstName} {user.lastName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/calendar')}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition font-medium"
              >
                <FaCalendar />
                <span className="hidden sm:inline">Calendar</span>
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-medium"
              >
                <FaCog />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {schoolYears.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No School Years Available</h3>
            <p className="text-gray-600">Please contact your administrator to add school years.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schoolYears.map((sy) => (
              <button
                key={sy._id}
                onClick={() => handleSelect(sy.year)}
                className="bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-500 hover:shadow-xl transition-all duration-300 p-8 text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <FaCalendarAlt className="text-4xl text-indigo-600" />
                  <FaArrowRight className="text-xl text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{sy.year}</h2>
                <p className="text-gray-600">Click to continue</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolYearSelection;
