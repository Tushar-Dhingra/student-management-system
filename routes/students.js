const express = require('express');
const {
  getAllStudents,
  getStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/', requireAdmin, getAllStudents);
router.post('/', requireAdmin, createStudent);
router.delete('/:id', requireAdmin, deleteStudent);

// Student can access own profile, Admin can access any
router.get('/profile/:id?', getStudentProfile);
router.put('/profile/:id?', updateStudent);

module.exports = router;