const express = require('express');
const Section = require('../models/Section');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all sections
router.get('/', auth, async (req, res) => {
  try {
    const sections = await Section.find({ isActive: true }).sort('order');
    res.json({ success: true, sections });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all sections (including inactive - admin only)
router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const sections = await Section.find().sort('order');
    res.json({ success: true, sections });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create section (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const section = new Section(req.body);
    await section.save();
    res.status(201).json({ success: true, section });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update section (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, section });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete section (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
