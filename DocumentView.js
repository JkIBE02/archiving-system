import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';
import { FaUpload, FaTrash, FaDownload, FaExclamationTriangle, FaArrowLeft, FaFileAlt, FaCalendar, FaUser, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage, FaFile, FaTimes, FaExpand } from 'react-icons/fa';
import FacultyNavigation from '../components/FacultyNavigation';

const DocumentView = () => {
  const { sectionId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [missingInfo, setMissingInfo] = useState({});
  const [files, setFiles] = useState([]);
  const [fileSubjects, setFileSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('midterm');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const schoolYear = sessionStorage.getItem('selectedSchoolYear');
  const semester = sessionStorage.getItem('selectedSemester');

  // Map URL slugs to section names and config
  const sectionConfig = {
    'table-of-specification': { 
      name: 'Table of Specification', 
      documentType: 'general', 
      hasTabs: false 
    },
    'course-syllabus': { 
      name: 'Course Syllabus', 
      documentType: 'general', 
      hasTabs: false 
    },
    'course-syllabus-acceptance': { 
      name: 'Course Syllabus Acceptance Form', 
      documentType: 'general', 
      hasTabs: false 
    },
    'course-syllabus-acceptance-form': { 
      name: 'Course Syllabus Acceptance Form', 
      documentType: 'general', 
      hasTabs: false 
    },
    'class-record': { 
      name: 'Class Record', 
      documentType: 'general', 
      hasTabs: false 
    },
    'course-module': { 
      name: 'Course Module', 
      documentType: 'general', 
      hasTabs: false 
    },
    'attendance-sheet': { 
      name: 'Attendance Sheet', 
      documentType: 'midterm-final', 
      hasTabs: true 
    },
    'summary-test-results': { 
      name: 'Summary of Test Results', 
      documentType: 'midterm-final', 
      hasTabs: true 
    },
    'summary-of-test-results': { 
      name: 'Summary of Test Results', 
      documentType: 'midterm-final', 
      hasTabs: true 
    },
    'project': { 
      name: 'Project', 
      documentType: 'midterm-final', 
      hasTabs: true 
    },
    'exam': { 
      name: 'Exam', 
      documentType: 'midterm-final', 
      hasTabs: true 
    }
  };

  const config = sectionConfig[sectionId];

  useEffect(() => {
    if (!schoolYear || !semester) {
      navigate('/school-year');
      return;
    }
    if (!config) {
      console.error('Section not found:', sectionId);
      navigate('/section');
      return;
    }
    // Update selectedSection in session storage
    sessionStorage.setItem('selectedSection', config.name);
    fetchDocuments();
    fetchMissingSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sectionId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {
        schoolYear,
        semester,
        section: config.name,
        documentType: config.documentType
      };

      if (config.hasTabs) {
        params.examType = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      }

      const { data } = await documentAPI.getAll(params);
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissingSubjects = async () => {
    try {
      const params = {
        schoolYear,
        semester,
        section: config.name,
        documentType: config.documentType
      };

      if (config.hasTabs) {
        params.examType = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      }

      const { data } = await documentAPI.getMissingSubjects(params);
      setMissingInfo(data);
    } catch (err) {
      console.error('Error fetching missing subjects:', err);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setFileSubjects(new Array(selectedFiles.length).fill(''));
  };

  const handleSubjectChange = (index, value) => {
    const newSubjects = [...fileSubjects];
    newSubjects[index] = value;
    setFileSubjects(newSubjects);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newSubjects = fileSubjects.filter((_, i) => i !== index);
    setFiles(newFiles);
    setFileSubjects(newSubjects);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    for (let i = 0; i < fileSubjects.length; i++) {
      if (!fileSubjects[i] || fileSubjects[i].trim() === '') {
        alert(`Please enter subject name for file ${i + 1}`);
        return;
      }
    }

    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    formData.append('schoolYear', schoolYear);
    formData.append('semester', semester);
    formData.append('section', config.name);
    formData.append('documentType', config.documentType);
    if (config.hasTabs) {
      formData.append('examType', activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
    }
    formData.append('subjects', JSON.stringify(fileSubjects));

    setUploading(true);
    try {
      const { data } = await documentAPI.upload(formData);
      setFiles([]);
      setFileSubjects([]);
      document.getElementById('file-input').value = '';
      await fetchDocuments();
      await fetchMissingSubjects();
      alert(`✅ ${data.documents.length} file(s) uploaded successfully!`);
    } catch (err) {
      alert('❌ Upload failed: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await documentAPI.delete(id);
      await fetchDocuments();
      await fetchMissingSubjects();
      alert('✅ Document deleted successfully!');
    } catch (err) {
      alert('❌ Delete failed');
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
        return <FaFilePdf className="text-red-500 text-4xl" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-500 text-4xl" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-500 text-4xl" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-orange-500 text-4xl" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="text-purple-500 text-4xl" />;
      default:
        return <FaFile className="text-gray-500 text-4xl" />;
    }
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return ext;
  };

  const renderFilePreview = (doc) => {
    const fileType = getFileType(doc.originalName);
    const fileUrl = `http://localhost:5000${doc.filePath}`;

    if (fileType === 'pdf') {
      return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-96'}`}>
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={doc.originalName}
            style={{ minHeight: isFullscreen ? '100vh' : '500px' }}
          />
        </div>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
      return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black flex items-center justify-center' : 'w-full'}`}>
          <img
            src={fileUrl}
            alt={doc.originalName}
            className={`${isFullscreen ? 'max-h-screen max-w-screen object-contain' : 'w-full h-auto rounded-lg'}`}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="gray"%3EImage not found%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      );
    } else {
      return (
        <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-6">
              {getFileIcon(doc.originalName)}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {doc.originalName}
            </h3>
            
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaFileAlt className="text-indigo-600" />
                  <span>{formatFileSize(doc.fileSize)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUser className="text-indigo-600" />
                  <span>{doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(doc._id, doc.originalName)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition shadow-md hover:shadow-lg"
            >
              <FaDownload />
              Download File
            </button>
          </div>
        </div>
      );
    }
  };

  const canPreview = (filename) => {
    const ext = getFileType(filename);
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Section not found</h2>
          <p className="text-gray-600 mt-2">Invalid section: {sectionId}</p>
          <button
            onClick={() => navigate('/section')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Sections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/section')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Back to Sections"
              >
                <FaArrowLeft className="text-xl text-gray-600" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {schoolYear} • {semester} Semester
                </p>
              </div>
            </div>
            
            <FacultyNavigation user={user} showBackToHome={true} />
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      {missingInfo.missingSubjects?.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-2xl text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Missing {missingInfo.missingSubjects.length} subject(s):
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {missingInfo.missingSubjects.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs - Only show if hasTabs */}
      {config.hasTabs && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4">
              {['midterm', 'final'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 border-b-2 font-medium transition ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUpload className="text-indigo-600" />
            Upload Documents
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="relative">
              <input
                id="file-input"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                multiple
                required
              />
              <label
                htmlFor="file-input"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition"
              >
                <FaUpload className="text-gray-500" />
                <span className="text-gray-700">
                  {files.length > 0 ? `${files.length} file(s) selected` : 'Choose Files (Multiple)'}
                </span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                    <input
                      type="text"
                      placeholder="Subject name"
                      value={fileSubjects[index] || ''}
                      onChange={(e) => handleSubjectChange(index, e.target.value)}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || files.length === 0}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload />
                  Upload Documents
                </>
              )}
            </button>
          </form>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Uploaded Documents ({documents.length}/{user.subjects?.length || 0})
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FaFileAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <div 
                  key={doc._id} 
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setPreviewDoc(doc)}
                >
                  <div className="flex items-center justify-center mb-4 p-4 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition">
                    {getFileIcon(doc.originalName)}
                  </div>

                  <div className="mb-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
                      {doc.subject}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2 truncate" title={doc.originalName}>
                    {doc.originalName}
                  </h4>

                  <div className="space-y-1 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <FaUser />
                      <span>{doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendar />
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(doc._id, doc.originalName);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FaDownload />
                      Download
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc._id);
                      }}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto" 
          onClick={() => !isFullscreen && setPreviewDoc(null)}
        >
          <div 
            className={`bg-white rounded-2xl shadow-2xl ${isFullscreen ? 'fixed inset-4' : 'w-full max-w-5xl max-h-[95vh]'} overflow-y-auto`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                {getFileIcon(previewDoc.originalName)}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{previewDoc.subject}</h2>
                  <p className="text-sm text-gray-600">{previewDoc.originalName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canPreview(previewDoc.originalName) && (
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 text-gray-500 hover:text-indigo-600 transition"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    <FaExpand size={20} />
                  </button>
                )}
                <button 
                  onClick={() => {
                    setPreviewDoc(null);
                    setIsFullscreen(false);
                  }} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <div className="bg-white rounded-lg overflow-hidden shadow-inner">
                {renderFilePreview(previewDoc)}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">School Year</p>
                  <p className="font-semibold text-gray-900">{previewDoc.schoolYear}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium mb-1">Semester</p>
                  <p className="font-semibold text-gray-900">{previewDoc.semester}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    handleDownload(previewDoc._id, previewDoc.originalName);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <FaDownload />
                  Download
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this document?')) {
                      handleDelete(previewDoc._id);
                      setPreviewDoc(null);
                    }
                  }}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentView;
