// models/billModel.js

const db = require('../config/db');

const createBillPayment = async (transactionId, userId, billType, providerName, consumerNumber, billingMonth, dueDate) => {
  const [result] = await db.query(
    `INSERT INTO bill_payments (transaction_id, user_id, bill_type, provider_name, consumer_number, billing_month, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [transactionId, userId, billType, providerName, consumerNumber, billingMonth, dueDate]
  );
  return result.insertId;
};

const getBillsByUser = async (userId) => {
  const [rows] = await db.query(
    `SELECT b.*, t.transaction_date, t.status
     FROM bill_payments b
     JOIN transactions t ON b.transaction_id = t.transaction_id
     WHERE b.user_id = ?
     ORDER BY t.transaction_date DESC`,
    [userId]
  );
  return rows;
};

const getUpcomingBills = async (userId) => {
  const [rows] = await db.query(
    `SELECT bill_type, provider_name, due_date
     FROM bill_payments
     WHERE user_id = ? AND due_date >= CURDATE()
     ORDER BY due_date ASC
     LIMIT 5`,
    [userId]
  );
  return rows;
};

module.exports = { createBillPayment, getBillsByUser, getUpcomingBills };