const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

console.log('✅ Users route file loaded');

// Multer configuration for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('📁 Created profiles directory:', uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

console.log('✅ Multer configured');

// ========== PROFILE ROUTES (MUST COME FIRST) ==========

// Update profile (authenticated users)
router.put('/profile', auth, async (req, res) => {
  console.log('👤 Profile update route hit');
  try {
    const { firstName, lastName } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName },
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Change password (authenticated users)
router.put('/change-password', auth, async (req, res) => {
  console.log('🔒 Password change route hit');
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update profile picture (authenticated users)
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  console.log('📸 Profile picture upload route hit');
  try {
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('✅ File received:', req.file.filename);
    const user = await User.findById(req.user.id);
    
    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, '../uploads/profiles', path.basename(user.profilePicture));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log('🗑️ Deleted old profile picture');
      }
    }

    // Update with new profile picture
    user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    console.log('✅ Profile picture updated in database');
    res.json({ 
      success: true, 
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (err) {
    console.error('❌ Error uploading profile picture:', err);
    // Delete uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

console.log('✅ Profile picture route registered');

// ========== ADMIN ROUTES ==========

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, subjects } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      subjects: subjects || []
    });

    await user.save();
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully', 
      user: { 
        id: user._id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user (admin only) - THIS MUST BE LAST
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { firstName, lastName, subjects, isActive, email } = req.body;
    const updateData = { firstName, lastName, subjects, isActive };
    
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updateData.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

console.log('✅ All user routes registered');

module.exports = router;
