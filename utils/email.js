const nodemailer = require('nodemailer');

let testAccount = null;

const getTransporter = async () => {
  // 1. If we have Env Vars, use them (Production/Configured mode)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true,
      logger: true
    });
  }

  // 2. Fallback: Use Ethereal Test Account (Development/Unconfigured mode)
  if (!testAccount) {
    console.log('No EMAIL_USER/PASS provided. Creating temporary Ethereal account...');
    try {
      testAccount = await nodemailer.createTestAccount();
      console.log('Created Ethereal Account:', testAccount.user);
    } catch (err) {
      console.error('Failed to create Ethereal account:', err);
      // Fallback to a dummy transporter that will fail but won't crash process immediately
      throw new Error('Could not create email transporter');
    }
  }

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;

  // Ensure we have a valid 'from' address
  const sender = process.env.EMAIL_USER || 'test@example.com';

  const mailOptions = {
    from: `"Student Management" <${sender}>`,
    to: email,
    subject: 'Email Verification - Student Management',
    html: `
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  console.log(`Attempting to send verification email to ${email}...`);
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);

    console.log('Verification email sent successfully.');
    console.log('Message ID:', info.messageId);
    // CRITICAL: Log the Preview URL so user can click it in Render logs
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error('Error sending verification email:', error);
    // Don't throw if just testing, but nice to know
    throw error;
  }
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

  const sender = process.env.EMAIL_USER || 'test@example.com';

  const mailOptions = {
    from: `"Student Management" <${sender}>`,
    to: email,
    subject: 'Password Reset - Student Management',
    html: `
      <h2>Password Reset</h2>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent.');
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };