const express = require('express');
const Deadline = require('../models/Deadline');
const User = require('../models/User');
const Document = require('../models/Document');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all deadlines
router.get('/', auth, async (req, res) => {
  try {
    const { schoolYear, semester, section } = req.query;
    const filter = { isActive: true };

    if (schoolYear) filter.schoolYear = schoolYear;
    if (semester) filter.semester = semester;
    if (section) filter.section = section;

    // Faculty only sees deadlines assigned to them or all faculty
    if (req.user.role === 'faculty') {
      filter.$or = [
        { targetFaculty: req.user.id },
        { targetFaculty: { $size: 0 } }
      ];
    }

    const deadlines = await Deadline.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('targetFaculty', 'firstName lastName email')
      .sort('dueDate');

    res.json({ success: true, deadlines });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create deadline (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { title, description, schoolYear, semester, section, examType, dueDate, targetFaculty } = req.body;

    const deadline = new Deadline({
      title,
      description,
      schoolYear,
      semester,
      section,
      examType,
      dueDate,
      createdBy: req.user.id,
      targetFaculty: targetFaculty || []
    });

    await deadline.save();
    await deadline.populate('createdBy', 'firstName lastName');
    await deadline.populate('targetFaculty', 'firstName lastName email');

    res.status(201).json({ success: true, deadline });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update deadline (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const deadline = await Deadline.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate('createdBy', 'firstName lastName')
    .populate('targetFaculty', 'firstName lastName email');

    res.json({ success: true, deadline });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete deadline (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Deadline.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deadline deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get faculty compliance status for a deadline
router.get('/:id/compliance', auth, adminAuth, async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id).populate('targetFaculty');
    
    if (!deadline) {
      return res.status(404).json({ message: 'Deadline not found' });
    }

    const faculty = deadline.targetFaculty.length > 0 
      ? deadline.targetFaculty 
      : await User.find({ role: 'faculty', isActive: true });

    const compliance = await Promise.all(faculty.map(async (fac) => {
      const hasSubmitted = await Document.findOne({
        uploadedBy: fac._id,
        schoolYear: deadline.schoolYear,
        semester: deadline.semester,
        section: deadline.section,
        examType: deadline.examType,
        createdAt: { $lte: deadline.dueDate }
      });

      return {
        faculty: {
          id: fac._id,
          name: `${fac.firstName} ${fac.lastName}`,
          email: fac.email,
          profilePicture: fac.profilePicture
        },
        submitted: !!hasSubmitted,
        submittedAt: hasSubmitted?.createdAt,
        isLate: hasSubmitted && new Date(hasSubmitted.createdAt) > new Date(deadline.dueDate)
      };
    }));

    res.json({ success: true, compliance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
