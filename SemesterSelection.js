import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import FacultyNavigation from '../components/FacultyNavigation';

const SemesterSelection = () => {
  const navigate = useNavigate();
  const schoolYear = sessionStorage.getItem('selectedSchoolYear');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!schoolYear) {
    navigate('/school-year');
    return null;
  }

  const handleSelect = (semester) => {
    sessionStorage.setItem('selectedSemester', semester);
    navigate('/section');
  };

  const semesters = [
    {
      id: 'First',
      title: 'First Semester',
      description: 'Start of Academic Year',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'Second',
      title: 'Second Semester',
      description: 'End of Academic Year',
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/school-year')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Back"
              >
                <FaArrowLeft className="text-xl text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Select Semester</h1>
                <p className="text-sm text-gray-600">School Year: {schoolYear}</p>
              </div>
            </div>
            
            <FacultyNavigation user={user} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {semesters.map((semester) => (
            <button
              key={semester.id}
              onClick={() => handleSelect(semester.id)}
              className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-10"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${semester.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className={`w-16 h-16 bg-gradient-to-br ${semester.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <FaBook className="text-3xl text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{semester.title}</h2>
                <p className="text-gray-600 mb-6">{semester.description}</p>
                
                <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  <span>Continue</span>
                  <FaArrowRight className="ml-2" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SemesterSelection;
