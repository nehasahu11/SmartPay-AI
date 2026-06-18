// routes/voiceRoutes.js

const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/log', authMiddleware, voiceController.logCommand);
router.get('/history', authMiddleware, voiceController.getCommandHistory);

module.exports = router;