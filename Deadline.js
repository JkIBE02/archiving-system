const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  schoolYear: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    enum: ['First', 'Second'],
    required: true
  },
  section: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['Midterm', 'Final'],
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetFaculty: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Deadline', deadlineSchema);
