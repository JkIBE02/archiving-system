const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Section = require('../models/Section');
const SchoolYear = require('../models/SchoolYear');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminExists = await User.findOne({ email: 'admin@archive.com' });
    
    if (!adminExists) {
      await User.create({
        email: 'admin@archive.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        subjects: [],
        isActive: true
      });
      console.log('✅ Admin user created: admin@archive.com / admin123');
    } else {
      console.log('⚠️ Admin user already exists');
    }

    // Create Faculty User
    const facultyExists = await User.findOne({ email: 'faculty@archive.com' });
    if (!facultyExists) {
      await User.create({
        email: 'faculty@archive.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'faculty',
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science'],
        isActive: true
      });
      console.log('✅ Faculty user created: faculty@archive.com / admin123');
    } else {
      console.log('⚠️ Faculty user already exists');
    }

    // Create Sections
    const sectionsCount = await Section.countDocuments();
    if (sectionsCount === 0) {
      await Section.insertMany([
        { name: 'Exam', description: 'Midterm and Final Exams', isActive: true, order: 1 },
        { name: 'TOS', description: 'Table of Specifications', isActive: true, order: 2 },
        { name: 'Course and Syllabus', description: 'Course Materials and Syllabus', isActive: true, order: 3 }
      ]);
      console.log('✅ Sections created');
    } else {
      console.log('⚠️ Sections already exist');
    }

    // Create School Years
    const schoolYearsCount = await SchoolYear.countDocuments();
    if (schoolYearsCount === 0) {
      await SchoolYear.insertMany([
        { year: '2023-2024', isActive: true },
        { year: '2024-2025', isActive: true },
        { year: '2025-2026', isActive: true }
      ]);
      console.log('✅ School years created');
    } else {
      console.log('⚠️ School years already exist');
    }

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('Login credentials:');
    console.log('Admin: admin@archive.com / admin123');
    console.log('Faculty: faculty@archive.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
