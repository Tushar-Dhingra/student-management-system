const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});

    // Create admin user
    const adminUser = new User({
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });
    await adminUser.save();

    // Create student user
    const studentUser = new User({
      email: 'student@test.com',
      password: 'student123',
      role: 'student',
      isVerified: true
    });
    await studentUser.save();

    // Create student profile
    const student = new Student({
      name: 'John Doe',
      email: 'student@test.com',
      course: 'MERN Bootcamp',
      userId: studentUser._id
    });
    await student.save();

    console.log('Seed data created successfully');
    console.log('Admin: admin@test.com / admin123');
    console.log('Student: student@test.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();