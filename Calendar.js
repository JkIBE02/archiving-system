import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deadlineAPI, schoolYearAPI } from '../services/api';
import { FaPlus, FaClock, FaExclamationTriangle, FaCheckCircle, FaTimes, FaUsers, FaArrowLeft, FaCog } from 'react-icons/fa';
import FacultyNavigation from '../components/FacultyNavigation';

const Calendar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deadlines, setDeadlines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [schoolYears, setSchoolYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [complianceData, setComplianceData] = useState([]);

  useEffect(() => {
    fetchDeadlines();
    if (user.role === 'admin') {
      fetchSchoolYears();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const fetchDeadlines = async () => {
    try {
      const { data } = await deadlineAPI.getAll();
      setDeadlines(data.deadlines || []);
    } catch (err) {
      console.error('Error fetching deadlines:', err);
    }
  };

  const fetchSchoolYears = async () => {
    try {
      const { data } = await schoolYearAPI.getAll();
      setSchoolYears(data.schoolYears || []);
    } catch (err) {
      console.error('Error fetching school years:', err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getDeadlinesForDate = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return deadlines.filter(d => new Date(d.dueDate).toDateString() === dateStr);
  };

  const openModal = (date = null) => {
    const defaultDateTime = date 
      ? new Date(currentDate.getFullYear(), currentDate.getMonth(), date, 23, 59).toISOString().slice(0, 16)
      : '';
    
    setFormData({
      title: '',
      description: '',
      schoolYear: '',
      semester: 'First',
      section: 'Exam',
      examType: 'Midterm',
      dueDate: defaultDateTime,
      targetFaculty: []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData._id) {
        await deadlineAPI.update(formData._id, formData);
      } else {
        await deadlineAPI.create(formData);
      }
      setShowModal(false);
      fetchDeadlines();
      alert('✅ Deadline saved successfully!');
    } catch (err) {
      alert('❌ Failed to save deadline');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deadline?')) return;
    
    try {
      await deadlineAPI.delete(id);
      fetchDeadlines();
      setSelectedDeadline(null);
    } catch (err) {
      alert('❌ Delete failed');
    }
  };

  const viewCompliance = async (deadline) => {
    try {
      const { data } = await deadlineAPI.getCompliance(deadline._id);
      setComplianceData(data.compliance);
      setSelectedDeadline(deadline);
    } catch (err) {
      alert('❌ Failed to fetch compliance data');
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDeadlineColor = (deadline) => {
    const dueDate = new Date(deadline.dueDate);
    const today = new Date();
    const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return 'bg-red-500 text-white';
    if (daysUntil <= 3) return 'bg-orange-500 text-white';
    if (daysUntil <= 7) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(user.role === 'admin' ? '/admin' : '/school-year');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Back"
              >
                <FaArrowLeft className="text-xl text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendar & Deadlines</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {user.role === 'admin' ? 'Manage submission deadlines' : 'View upcoming deadlines'}
                </p>
              </div>
            </div>
            
            {user.role === 'faculty' ? (
              <FacultyNavigation user={user} showBackToHome={true} />
            ) : (
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-medium"
              >
                <FaCog />
                Settings
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Calendar Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={previousMonth} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              ←
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={nextMonth} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              →
            </button>
          </div>
          
          {user.role === 'admin' && (
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
            >
              <FaPlus />
              Add Deadline
            </button>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Days of Week */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-32 border border-gray-100 bg-gray-50"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayDeadlines = getDeadlinesForDate(day);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

              return (
                <div
                  key={day}
                  className={`h-32 border border-gray-100 p-2 hover:bg-gray-50 transition cursor-pointer ${
                    isToday ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => user.role === 'admin' && openModal(day)}
                >
                  <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {dayDeadlines.map(deadline => (
                      <div
                        key={deadline._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          user.role === 'admin' ? viewCompliance(deadline) : setSelectedDeadline(deadline);
                        }}
                        className={`text-xs p-1 rounded truncate ${getDeadlineColor(deadline)}`}
                        title={deadline.title}
                      >
                        {deadline.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines List */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {deadlines
              .filter(d => new Date(d.dueDate) >= new Date())
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .slice(0, 5)
              .map(deadline => (
                <div
                  key={deadline._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => user.role === 'admin' ? viewCompliance(deadline) : setSelectedDeadline(deadline)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getDeadlineColor(deadline).split(' ')[0]}`}></div>
                    <div>
                      <p className="font-semibold text-gray-900">{deadline.title}</p>
                      <p className="text-sm text-gray-600">{deadline.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaClock />
                      <span>
                        {new Date(deadline.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {deadline.examType} - {deadline.semester} Sem
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Deadline Modal */}
      {showModal && user.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {formData._id ? 'Edit' : 'Add'} Deadline
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Deadline Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.schoolYear}
                  onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select School Year</option>
                  {schoolYears.map(sy => (
                    <option key={sy._id} value={sy.year}>{sy.year}</option>
                  ))}
                </select>

                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>

                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="Exam">Exam</option>
                  <option value="TOS">TOS</option>
                  <option value="Course and Syllabus">Course and Syllabus</option>
                </select>

                <select
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                </select>
              </div>

              {/* Updated to datetime-local */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select the exact date and time for the deadline
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? 'Saving...' : 'Save Deadline'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compliance/Details Modal */}
      {selectedDeadline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{selectedDeadline.title}</h2>
              <button onClick={() => { setSelectedDeadline(null); setComplianceData([]); }} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">{selectedDeadline.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">School Year</p>
                    <p className="font-semibold text-gray-900">{selectedDeadline.schoolYear}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium">Semester</p>
                    <p className="font-semibold text-gray-900">{selectedDeadline.semester}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Section</p>
                    <p className="font-semibold text-gray-900">{selectedDeadline.section}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600 font-medium">Exam Type</p>
                    <p className="font-semibold text-gray-900">{selectedDeadline.examType}</p>
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg flex items-center gap-2">
                  <FaClock className="text-red-600" />
                  <div>
                    <p className="text-xs text-red-600 font-medium">Due Date & Time</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedDeadline.dueDate).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {user.role === 'admin' && complianceData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaUsers />
                    Faculty Compliance
                  </h3>
                  <div className="space-y-2">
                    {complianceData.map((item) => (
                      <div
                        key={item.faculty.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          item.submitted ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                            {item.faculty.profilePicture ? (
                              <img src={`http://localhost:5000${item.faculty.profilePicture}`} alt={item.faculty.name} className="w-full h-full object-cover" />
                            ) : (
                              <FaUsers className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.faculty.name}</p>
                            <p className="text-sm text-gray-600">{item.faculty.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.submitted ? (
                            <>
                              <FaCheckCircle className="text-green-600" size={20} />
                              <div className="text-right">
                                <p className="text-sm font-semibold text-green-700">Submitted</p>
                                {item.isLate && <p className="text-xs text-orange-600">Late</p>}
                              </div>
                            </>
                          ) : (
                            <>
                              <FaExclamationTriangle className="text-red-600" size={20} />
                              <p className="text-sm font-semibold text-red-700">Not Submitted</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user.role === 'admin' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleDelete(selectedDeadline._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Delete Deadline
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
