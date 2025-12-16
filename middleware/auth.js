const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Check if user is student or admin accessing own data
const requireStudentOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  
  if (req.user.role === 'student' && req.params.id === req.user._id.toString()) {
    return next();
  }
  
  res.status(403).json({ message: 'Access denied.' });
};

module.exports = { authenticate, requireAdmin, requireStudentOrAdmin };