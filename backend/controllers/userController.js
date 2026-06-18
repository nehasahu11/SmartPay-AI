// controllers/userController.js

const userModel = require('../models/userModel');

// ---------- Get Profile ----------
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findUserById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

// ---------- Update Profile ----------
const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, profilePicture } = req.body;
    await userModel.updateUserProfile(req.user.user_id, fullName, phoneNumber, profilePicture);
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

module.exports = { getProfile, updateProfile };