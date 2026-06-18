// models/rechargeModel.js

const db = require('../config/db');

const createRecharge = async (transactionId, userId, rechargeType, operatorName, accountNumber, planDetails) => {
  const [result] = await db.query(
    `INSERT INTO recharges (transaction_id, user_id, recharge_type, operator_name, account_number, plan_details)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [transactionId, userId, rechargeType, operatorName, accountNumber, planDetails]
  );
  return result.insertId;
};

const getRechargesByUser = async (userId) => {
  const [rows] = await db.query(
    `SELECT r.*, t.transaction_date, t.status
     FROM recharges r
     JOIN transactions t ON r.transaction_id = t.transaction_id
     WHERE r.user_id = ?
     ORDER BY t.transaction_date DESC`,
    [userId]
  );
  return rows;
};

module.exports = { createRecharge, getRechargesByUser };