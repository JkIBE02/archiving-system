const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  documentType: {
    type: String,
    enum: ['general', 'midterm-final'],
    required: true
  },
  examType: {
    type: String,
    enum: ['Midterm', 'Final', null],
    default: null
  },
  subject: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
