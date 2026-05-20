import React, { useState, useEffect } from 'react';
import { userAPI, sectionAPI, schoolYearAPI, documentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaFolder, FaCalendar, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaTimes, FaFileAlt, FaDownload, FaUser, FaClock, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFile, FaCog } from 'react-icons/fa';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterSY, setFilterSY] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchUsers();
    fetchSections();
    fetchSchoolYears();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filterSY, filterSemester, filterSection]);

  const fetchUsers = async () => {
    try {
      const { data } = await userAPI.getAll();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchSections = async () => {
    try {
      const { data } = await sectionAPI.getAllAdmin();
      setSections(data.sections || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  const fetchSchoolYears = async () => {
    try {
      const { data } = await schoolYearAPI.getAllAdmin();
      setSchoolYears(data.schoolYears || []);
    } catch (err) {
      console.error('Error fetching school years:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const params = {};
      if (filterSY !== 'all') params.schoolYear = filterSY;
      if (filterSemester !== 'all') params.semester = filterSemester;
      if (filterSection !== 'all') params.section = filterSection;

      const { data } = await documentAPI.getAll(params);
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const openModal = (type, item = {}) => {
    setModalType(type);
    setFormData(item._id ? item : getDefaultFormData(type));
    setShowModal(true);
  };

  const getDefaultFormData = (type) => {
    switch(type) {
      case 'user':
        return { firstName: '', lastName: '', email: '', password: '', role: 'faculty', subjects: [] };
      case 'section':
        return { name: '', description: '', order: 0, isActive: true };
      case 'schoolYear':
        return { year: '', isActive: true };
      default:
        return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalType === 'user') {
        const userData = { ...formData };
        if (typeof userData.subjects === 'string') {
          userData.subjects = userData.subjects.split(',').map(s => s.trim()).filter(Boolean);
        }
        
        if (formData._id) {
          await userAPI.update(formData._id, userData);
        } else {
          await userAPI.create(userData);
        }
        fetchUsers();
      } else if (modalType === 'section') {
        if (formData._id) {
          await sectionAPI.update(formData._id, formData);
        } else {
          await sectionAPI.create(formData);
        }
        fetchSections();
      } else if (modalType === 'schoolYear') {
        if (formData._id) {
          await schoolYearAPI.update(formData._id, formData);
        } else {
          await schoolYearAPI.create(formData);
        }
        fetchSchoolYears();
      }
      setShowModal(false);
      setFormData({});
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      if (type === 'user') {
        await userAPI.delete(id);
        fetchUsers();
      } else if (type === 'section') {
        await sectionAPI.delete(id);
        fetchSections();
      } else if (type === 'schoolYear') {
        await schoolYearAPI.delete(id);
        fetchSchoolYears();
      } else if (type === 'document') {
        await documentAPI.delete(id);
        fetchDocuments();
      }
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const response = await documentAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('❌ Download failed');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FaFilePdf className="text-red-500 text-2xl" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-500 text-2xl" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-500 text-2xl" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-orange-500 text-2xl" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="text-purple-500 text-2xl" />;
      default:
        return <FaFile className="text-gray-500 text-2xl" />;
    }
  };

  const getFileTypeBadge = (filename) => {
    const ext = filename.split('.').pop().toUpperCase();
    const colors = {
      'PDF': 'bg-red-100 text-red-800',
      'DOC': 'bg-blue-100 text-blue-800',
      'DOCX': 'bg-blue-100 text-blue-800',
      'XLS': 'bg-green-100 text-green-800',
      'XLSX': 'bg-green-100 text-green-800',
      'PPT': 'bg-orange-100 text-orange-800',
      'PPTX': 'bg-orange-100 text-orange-800',
      'JPG': 'bg-purple-100 text-purple-800',
      'JPEG': 'bg-purple-100 text-purple-800',
      'PNG': 'bg-purple-100 text-purple-800',
      'GIF': 'bg-purple-100 text-purple-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-bold rounded ${colors[ext] || 'bg-gray-100 text-gray-800'}`}>
        {ext}
      </span>
    );
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'documents', label: 'All Documents', icon: FaFileAlt },
    { id: 'sections', label: 'Sections', icon: FaFolder },
    { id: 'schoolYears', label: 'School Years', icon: FaCalendar }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - ✅ Made Sticky */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              {/* Admin Profile Picture */}
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
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.firstName} {user.lastName}</p>
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

      {/* Tabs - ✅ Made Sticky */}
      <div className="sticky top-[73px] z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => openModal('user')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
              >
                <FaPlus />
                Add User
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
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
                            <FaUser className={`text-lg text-gray-400 ${user.profilePicture ? 'hidden' : ''}`} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.subjects?.join(', ') || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openModal('user', user)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete('user', user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab - UPDATED */}
        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">All Faculty Documents ({documents.length})</h2>
              
              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={filterSY}
                  onChange={(e) => setFilterSY(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All School Years</option>
                  {schoolYears.map(sy => (
                    <option key={sy._id} value={sy.year}>{sy.year}</option>
                  ))}
                </select>

                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Semesters</option>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>

                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Sections</option>
                  {sections.map(sec => (
                    <option key={sec._id} value={sec.name}>{sec.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FaFileAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No documents found</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1">
                              {getFileIcon(doc.originalName)}
                              {getFileTypeBadge(doc.originalName)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{doc.originalName}</div>
                              <div className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{doc.subject}</td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                {doc.uploadedBy?.profilePicture ? (
                                  <img 
                                    src={`http://localhost:5000${doc.uploadedBy.profilePicture}`} 
                                    alt={doc.uploadedBy?.firstName} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <FaUser className={`text-sm text-gray-400 ${doc.uploadedBy?.profilePicture ? 'hidden' : ''}`} />
                              </div>
                              <span className="text-sm text-gray-900">{doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}</span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 text-sm text-gray-600">{doc.schoolYear}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {doc.semester}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{doc.section}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              doc.examType === 'Midterm' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {doc.examType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaClock />
                              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDownload(doc._id, doc.originalName)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              title="Download"
                            >
                              <FaDownload />
                            </button>
                            <button
                              onClick={() => handleDelete('document', doc._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Section Management</h2>
              <button
                onClick={() => openModal('section')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
              >
                <FaPlus />
                Add Section
              </button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <div key={section._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      section.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {section.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{section.description || 'No description'}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('section', section)}
                      className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete('section', section._id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* School Years Tab */}
        {activeTab === 'schoolYears' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">School Year Management</h2>
              <button
                onClick={() => openModal('schoolYear')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
              >
                <FaPlus />
                Add School Year
              </button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schoolYears.map((sy) => (
                <div key={sy._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-indigo-600">{sy.year}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {sy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('schoolYear', sy)}
                      className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete('schoolYear', sy._id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal - same as before */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {formData._id ? 'Edit' : 'Add'} {modalType === 'user' ? 'User' : modalType === 'section' ? 'Section' : 'School Year'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalType === 'user' && (
                <>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={!!formData._id}
                  />
                  {!formData._id && (
                    <input
                      type="password"
                      placeholder="Password"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  )}
                  <select
                    value={formData.role || 'faculty'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Subjects (comma-separated)"
                    value={Array.isArray(formData.subjects) ? formData.subjects.join(', ') : (formData.subjects || '')}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </>
              )}

              {modalType === 'section' && (
                <>
                  <input
                    type="text"
                    placeholder="Section Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Order"
                    value={formData.order || 0}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </>
              )}

              {modalType === 'schoolYear' && (
                <>
                  <input
                    type="text"
                    placeholder="School Year (e.g., 2024-2025)"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? 'Saving...' : 'Save'}
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
    </div>
  );
};

export default AdminDashboard;
