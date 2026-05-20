import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { FaUser, FaLock, FaCamera, FaArrowLeft, FaSave, FaEye, FaEyeSlash, FaCalendar, FaHome } from 'react-icons/fa';

const Settings = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile picture
  const [profilePicture, setProfilePicture] = useState(
    user.profilePicture ? `http://localhost:5000${user.profilePicture}` : null
  );
  const [selectedFile, setSelectedFile] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await userAPI.updateProfile(profileForm);
      
      // Update localStorage
      const updatedUser = { ...user, ...profileForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: '❌ Password must be at least 8 characters' });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '❌ Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setMessage({ type: 'success', text: '✅ Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || '❌ Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      const { data } = await userAPI.uploadProfilePicture(formData);
      
      // Update localStorage
      const updatedUser = { ...user, profilePicture: data.profilePicture };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: '✅ Profile picture updated successfully!' });
      setSelectedFile(null);
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Failed to upload profile picture' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 2) {
      navigate(-1); // Go back to previous page
    } else {
      // Fallback: go to appropriate home page
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
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-600 mt-1">Manage your account settings</p>
              </div>
            </div>
            
            {user.role === 'faculty' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/school-year')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition font-medium"
                >
                  <FaHome />
                  <span className="hidden sm:inline">Home</span>
                </button>
                <button
                  onClick={() => navigate('/calendar')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition font-medium"
                >
                  <FaCalendar />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${
                activeTab === 'profile'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaUser />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${
                activeTab === 'password'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaLock />
              Password
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Picture Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="text-5xl text-gray-400" />
                    )}
                  </div>
                  <label htmlFor="profile-picture" className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full cursor-pointer transition">
                    <FaCamera />
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-3">
                    Upload a new profile picture. Max file size: 5MB
                  </p>
                  {selectedFile && (
                    <button
                      onClick={handleProfilePictureUpload}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                    >
                      {loading ? 'Uploading...' : 'Save Picture'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                >
                  <FaSave />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
              >
                <FaLock />
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
