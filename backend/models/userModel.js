// models/userModel.js
// Raw SQL queries related to the users table

const db = require('../config/db');

const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const findUserById = async (userId) => {
  const [rows] = await db.query(
    'SELECT user_id, full_name, email, phone_number, profile_picture, created_at FROM users WHERE user_id = ?',
    [userId]
  );
  return rows[0];
};

const createUser = async (fullName, email, hashedPassword, phoneNumber) => {
  const [result] = await db.query(
    'INSERT INTO users (full_name, email, password, phone_number) VALUES (?, ?, ?, ?)',
    [fullName, email, hashedPassword, phoneNumber]
  );
  return result.insertId;
};

const updateUserProfile = async (userId, fullName, phoneNumber, profilePicture) => {
  await db.query(
    'UPDATE users SET full_name = ?, phone_number = ?, profile_picture = ? WHERE user_id = ?',
    [fullName, phoneNumber, profilePicture, userId]
  );
};

const setResetToken = async (email, token, expiry) => {
  await db.query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
    [token, expiry, email]
  );
};

const findUserByResetToken = async (token) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [token]
  );
  return rows[0];
};

const updatePasswordAndClearToken = async (userId, hashedPassword) => {
  await db.query(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?',
    [hashedPassword, userId]
  );
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  setResetToken,
  findUserByResetToken,
  updatePasswordAndClearToken
};