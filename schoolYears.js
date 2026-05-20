const express = require('express');
const SchoolYear = require('../models/SchoolYear');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all school years
router.get('/', auth, async (req, res) => {
  try {
    const schoolYears = await SchoolYear.find({ isActive: true }).sort('-year');
    res.json({ success: true, schoolYears });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all school years (including inactive - admin only)
router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const schoolYears = await SchoolYear.find().sort('-year');
    res.json({ success: true, schoolYears });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create school year (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const schoolYear = new SchoolYear(req.body);
    await schoolYear.save();
    res.status(201).json({ success: true, schoolYear });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update school year (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const schoolYear = await SchoolYear.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, schoolYear });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete school year (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await SchoolYear.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'School year deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
