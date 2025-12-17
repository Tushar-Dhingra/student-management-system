const express = require('express');
const { signup, login, logout, getMe, verifyEmail, forgotPassword, resetPassword, changePassword, resendVerificationEmail } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', authenticate, changePassword);
router.post('/resend-verification', resendVerificationEmail);

module.exports = router;