const Student = require('../models/Student');
const User = require('../models/User');

// Get all students (Admin only)
// Get all students (Admin only)
const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalStudents = await Student.countDocuments();
    const totalPages = Math.ceil(totalStudents / limit);

    const students = await Student.find()
      .populate('userId', 'email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Optional: sort by newest first

    res.json({
      students,
      currentPage: page,
      totalPages,
      totalStudents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student profile (Student own profile or Admin)
const getStudentProfile = async (req, res) => {
  try {
    let student;

    if (req.user.role === 'admin') {
      student = await Student.findById(req.params.id).populate('userId', 'email');
    } else {
      student = await Student.findOne({ userId: req.user._id }).populate('userId', 'email');
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create student (Admin only)
const createStudent = async (req, res) => {
  try {
    const { name, email, course, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user account
    const user = new User({
      email,
      password,
      role: 'student'
    });
    await user.save();

    // Create student profile
    const student = new Student({
      name,
      email,
      course,
      userId: user._id
    });
    await student.save();

    const populatedStudent = await Student.findById(student._id).populate('userId', 'email');
    res.status(201).json(populatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { name, email, course } = req.body;
    let student;

    if (req.user.role === 'admin') {
      student = await Student.findById(req.params.id);
    } else {
      student = await Student.findOne({ userId: req.user._id });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (course) student.course = course;

    await student.save();

    // Update user email if changed
    if (email) {
      await User.findByIdAndUpdate(student.userId, { email });
    }

    const updatedStudent = await Student.findById(student._id).populate('userId', 'email');
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete student (Admin only)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete user account
    await User.findByIdAndDelete(student.userId);

    // Delete student profile
    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent
};