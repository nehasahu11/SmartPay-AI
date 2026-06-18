// controllers/voiceController.js

const db = require('../config/db');

// ---------- Log a Voice Command ----------
const logCommand = async (req, res) => {
  try {
    const { commandText, recognizedAction, status } = req.body;
    const userId = req.user.user_id;

    await db.query(
      `INSERT INTO voice_command_logs (user_id, command_text, recognized_action, status)
       VALUES (?, ?, ?, ?)`,
      [userId, commandText, recognizedAction || null, status || 'unrecognized']
    );

    res.status(201).json({ success: true, message: 'Voice command logged.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error logging voice command.' });
  }
};

// ---------- Get Voice Command History ----------
const getCommandHistory = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM voice_command_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.user_id]
    );
    res.json({ success: true, logs: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching voice command history.' });
  }
};

module.exports = { logCommand, getCommandHistory };