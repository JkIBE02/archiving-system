const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents and images are allowed.'));
    }
  }
});

// Upload multiple documents - UPDATED for both types
router.post('/upload', auth, upload.array('files', 10), async (req, res) => {
  try {
    const { schoolYear, semester, section, documentType, examType, subjects } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const subjectsArray = JSON.parse(subjects);

    if (req.files.length !== subjectsArray.length) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({ message: 'Number of files must match number of subjects' });
    }

    const documents = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const subject = subjectsArray[i];

      const document = new Document({
        fileName: file.filename,
        originalName: file.originalname,
        filePath: `/uploads/${file.filename}`,
        fileSize: file.size,
        uploadedBy: req.user.id,
        schoolYear,
        semester,
        section,
        documentType,
        examType: documentType === 'midterm-final' ? examType : null,
        subject
      });

      await document.save();
      await document.populate('uploadedBy', 'firstName lastName email profilePicture');
      documents.push(document);
    }

    res.status(201).json({ 
      success: true, 
      message: `${documents.length} file(s) uploaded successfully`,
      documents 
    });
  } catch (err) {
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get documents with filters - UPDATED
router.get('/', auth, async (req, res) => {
  try {
    const { schoolYear, semester, section, documentType, examType } = req.query;
    const filter = {};

    if (schoolYear) filter.schoolYear = schoolYear;
    if (semester) filter.semester = semester;
    if (section) filter.section = section;
    if (documentType) filter.documentType = documentType;
    if (examType && examType !== 'null') filter.examType = examType;

    if (req.user.role === 'faculty') {
      filter.uploadedBy = req.user.id;
    }

    const documents = await Document.find(filter)
      .populate('uploadedBy', 'firstName lastName email profilePicture')
      .sort('-createdAt');

    const normalizedDocuments = documents.map(doc => ({
      ...doc.toObject(),
      filePath: doc.filePath.replace(/\\/g, '/')
    }));

    res.json({ success: true, documents: normalizedDocuments });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get missing subjects - UPDATED for both types
router.get('/missing-subjects', auth, async (req, res) => {
  try {
    const { schoolYear, semester, section, documentType, examType } = req.query;

    const user = await User.findById(req.user.id);
    const filter = {
      uploadedBy: req.user.id,
      schoolYear,
      semester,
      section,
      documentType
    };

    if (documentType === 'midterm-final' && examType) {
      filter.examType = examType;
    }

    const uploadedDocs = await Document.find(filter);

    const uploadedSubjects = uploadedDocs.map(doc => doc.subject);
    const missingSubjects = user.subjects.filter(sub => !uploadedSubjects.includes(sub));

    res.json({ 
      success: true,
      missingSubjects, 
      totalSubjects: user.subjects.length, 
      uploadedCount: uploadedSubjects.length,
      uploadedSubjects
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download document - MUST be before /:id route
router.get('/download/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove leading slash from path if exists
    let filePath = document.filePath;
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }
    
    const fullPath = path.join(__dirname, '..', filePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.originalName)}"`);
    
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: 'Download error' });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
