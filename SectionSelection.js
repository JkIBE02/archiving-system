import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sectionAPI } from '../services/api';
import { FaFolder, FaArrowLeft } from 'react-icons/fa';
import FacultyNavigation from '../components/FacultyNavigation';

const SectionSelection = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const schoolYear = sessionStorage.getItem('selectedSchoolYear');
  const semester = sessionStorage.getItem('selectedSemester');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!schoolYear || !semester) {
      navigate('/school-year');
      return;
    }
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSections = async () => {
    try {
      const { data } = await sectionAPI.getAll();
      setSections(data.sections || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (sectionName) => {
    sessionStorage.setItem('selectedSection', sectionName);
    // Convert section name to URL slug (handle spaces, special chars)
    const sectionId = sectionName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    navigate(`/document/${sectionId}`);
  };

  const iconColors = [
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-purple-500 to-pink-600',
    'bg-gradient-to-br from-green-500 to-teal-600',
    'bg-gradient-to-br from-orange-500 to-red-600',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/semester')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Back"
              >
                <FaArrowLeft className="text-xl text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Select Document</h1>
                <p className="text-sm text-gray-600">
                  {schoolYear} • {semester} Semester
                </p>
              </div>
            </div>
            
            <FacultyNavigation user={user} showBackToHome={true} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sections.length === 0 ? (
          <div className="text-center py-12">
            <FaFolder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sections Available</h3>
            <p className="text-gray-600">Please contact your administrator to add sections.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, index) => (
              <button
                key={section._id}
                onClick={() => handleSelect(section.name)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left group border-2 border-transparent hover:border-indigo-500"
              >
                <div className={`w-16 h-16 ${iconColors[index % iconColors.length]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <FaFolder className="text-3xl text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.name}</h2>
                <p className="text-gray-600 text-sm">{section.description || 'Click to continue'}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionSelection;
