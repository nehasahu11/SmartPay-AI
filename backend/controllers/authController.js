// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const userModel = require('../models/userModel');

// ---------- Register ----------
const register = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    if (!fullName || !email || !password || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser(fullName, email, hashedPassword, phoneNumber);

    res.status(201).json({ success: true, message: 'Registration successful.', userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ---------- Login ----------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { user_id: user.user_id, full_name: user.full_name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ---------- Forgot Password (Step 1: generate token) ----------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour validity

    await userModel.setResetToken(email, resetToken, expiry);

    // In a real deployment this token would be emailed. For the academic project,
    // we return it directly so it can be used in the reset-password screen.
    res.json({ success: true, message: 'Reset token generated.', resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error generating reset token.' });
  }
};

// ---------- Reset Password (Step 2: use token) ----------
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await userModel.findUserByResetToken(token);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updatePasswordAndClearToken(user.user_id, hashedPassword);

    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
};

// ---------- Logout ----------
// JWT is stateless, so logout is handled by deleting the token client-side.
// This endpoint exists for a clean API contract and could log the event server-side.
const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully. Please clear your local token.' });
};

module.exports = { register, login, forgotPassword, resetPassword, logout };