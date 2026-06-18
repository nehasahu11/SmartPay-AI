// models/predictionModel.js

const db = require('../config/db');

const savePrediction = async (userId, billType, predictedAmount, predictionMonth) => {
  const [result] = await db.query(
    `INSERT INTO bill_predictions (user_id, bill_type, predicted_amount, prediction_month)
     VALUES (?, ?, ?, ?)`,
    [userId, billType, predictedAmount, predictionMonth]
  );
  return result.insertId;
};

const getPredictionsByUser = async (userId) => {
  const [rows] = await db.query(
    'SELECT * FROM bill_predictions WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
};

const getBillHistoryForUser = async (userId, billType) => {
  const [rows] = await db.query(
    `SELECT t.amount, t.transaction_date
     FROM bill_payments b
     JOIN transactions t ON b.transaction_id = t.transaction_id
     WHERE b.user_id = ? AND b.bill_type = ?
     ORDER BY t.transaction_date ASC`,
    [userId, billType]
  );
  return rows;
};

module.exports = { savePrediction, getPredictionsByUser, getBillHistoryForUser };