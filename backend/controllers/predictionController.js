// controllers/predictionController.js
// Bridges Node.js to the Python ML scripts via predictionService

const predictionModel = require('../models/predictionModel');
const predictionService = require('../services/predictionService');

// ---------- Trigger a New Prediction ----------
const predictBill = async (req, res) => {
  try {
    const { billType } = req.body;
    const userId = req.user.user_id;

    if (!['electricity', 'water', 'gas', 'broadband'].includes(billType)) {
      return res.status(400).json({ success: false, message: 'Invalid bill type.' });
    }

    // Fetch historical data for this user + bill type
    const history = await predictionModel.getBillHistoryForUser(userId, billType);

    if (history.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Not enough historical data to generate a reliable prediction yet.'
      });
    }

    // Call the Python script (ml/bill_prediction/predict.py) via child_process
    const predictedAmount = await predictionService.runPrediction(billType, history);

    const predictionMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-06"
    const predictionId = await predictionModel.savePrediction(userId, billType, predictedAmount, predictionMonth);

    res.json({
      success: true,
      message: 'Prediction generated successfully.',
      predictionId,
      billType,
      predictedAmount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error generating prediction.' });
  }
};

// ---------- Get All Saved Predictions (for dashboard widget) ----------
const getPredictions = async (req, res) => {
  try {
    const predictions = await predictionModel.getPredictionsByUser(req.user.user_id);
    res.json({ success: true, predictions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching predictions.' });
  }
};

module.exports = { predictBill, getPredictions };