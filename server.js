const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ---------------------
// Middleware
// ---------------------
app.use(cors());
app.use(express.json());

// ---------------------
// Test route
// ---------------------
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// ---------------------
// API Routes
// ---------------------
console.log("📁 Loading auth routes...");

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/school-years', require('./routes/schoolYears'));
app.use('/api/deadlines', require('./routes/deadlines'));

// ---------------------
// Static files (uploads)
// ---------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', (req, res, next) => {
  if (req.path.endsWith('.pdf')) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
  }
  next();
});

// ---------------------
// Database connection
// ---------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ---------------------
// Start server
// ---------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads accessible at: http://localhost:${PORT}/uploads`);
});
