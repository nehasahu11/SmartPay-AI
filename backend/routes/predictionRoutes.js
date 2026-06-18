// routes/predictionRoutes.js

const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/predict', authMiddleware, predictionController.predictBill);
router.get('/', authMiddleware, predictionController.getPredictions);

module.exports = router;