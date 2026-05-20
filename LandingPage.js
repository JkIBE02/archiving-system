import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaCloud, FaLock, FaUsers, FaFileAlt, FaCheckCircle, FaGraduationCap } from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Archive System Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-white hidden sm:inline">Archive System</span>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Organize Your
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
              Academic Documents
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline document management for faculty and administrators. Upload, organize, and access all academic materials in one secure, centralized platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold text-lg transition duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl hover:shadow-indigo-500/50"
            >
              Get Started
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-lg transition duration-200 border border-indigo-500/30 hover:border-indigo-500/60"
            >
              Learn More
            </button>
          </div>

          {/* Hero Image/Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-slate-800/50 border border-indigo-500/30 backdrop-blur-xl rounded-2xl p-8 sm:p-12">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-indigo-400">Fast</div>
                  <p className="text-sm text-gray-400">Performance</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-purple-400">Secure</div>
                  <p className="text-sm text-gray-400">Encrypted</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-pink-400">Real-time</div>
                  <p className="text-sm text-gray-400">Sync</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900/50 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage academic documents efficiently
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-slate-800/50 border border-indigo-500/20 hover:border-indigo-500/60 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:shadow-indigo-500/10 backdrop-blur-sm">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500/40 transition">
                <FaCloud className="text-indigo-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Storage</h3>
              <p className="text-gray-400">
                Reliably store all your academic documents with encrypted backups and easy access.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/60 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/40 transition">
                <FaLock className="text-purple-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Security First</h3>
              <p className="text-gray-400">
                Enterprise-grade encryption and access control to protect your sensitive academic data.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-800/50 border border-pink-500/20 hover:border-pink-500/60 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:shadow-pink-500/10 backdrop-blur-sm">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/40 transition">
                <FaUsers className="text-pink-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Collaboration</h3>
              <p className="text-gray-400">
                Share documents and collaborate with faculty and administrators seamlessly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-slate-800/50 border border-cyan-500/20 hover:border-cyan-500/60 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:shadow-cyan-500/10 backdrop-blur-sm">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/40 transition">
                <FaFileAlt className="text-cyan-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Easy Management</h3>
              <p className="text-gray-400">
                Intuitive interface for uploading, organizing, and retrieving documents quickly.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-slate-800/50 border border-green-500/20 hover:border-green-500/60 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:shadow-green-500/10 backdrop-blur-sm">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/40 transition">
                <FaCheckCircle className="text-green-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Compliance Ready</h3>
              <p className="text-gray-400">
                Meet all academic requirements with built-in tracking and reporting features.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-slate-800/50 border border-orange-500/20 hover:border-orange-500/60 rounded-xl p-8 transition duration-300 hover:shadow-xl hover:shadow-orange-500/10 backdrop-blur-sm">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/40 transition">
                <FaGraduationCap className="text-orange-400 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Education Focused</h3>
              <p className="text-gray-400">
                Designed specifically for academic institutions and educational needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Easy
              </div>
              <p className="text-gray-400">To Use</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Secure
              </div>
              <p className="text-gray-400">Encrypted</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Fast
              </div>
              <p className="text-gray-400">Performance</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-2">
                Reliable
              </div>
              <p className="text-gray-400">Consistent</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-t border-indigo-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join hundreds of educators managing their academic documents with Archive System.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold text-lg transition duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 flex items-center justify-center gap-2 mx-auto group"
          >
            Get Started Now
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-500/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4 justify-center">
                <img 
                  src="/logo.png" 
                  alt="Archive System Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-white font-semibold">Archive System</span>
              </div>
              <p className="text-gray-400 text-sm text-center">
                Modern document management for academic institutions.
              </p>
            </div>
          </div>
          <div className="border-t border-indigo-500/20 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Archive System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
