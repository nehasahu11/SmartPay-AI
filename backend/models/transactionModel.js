// models/transactionModel.js

const db = require('../config/db');

const createTransaction = async (userId, categoryId, type, amount, paymentMethod) => {
  const [result] = await db.query(
    `INSERT INTO transactions (user_id, category_id, transaction_type, amount, status, payment_method)
     VALUES (?, ?, ?, ?, 'success', ?)`,
    [userId, categoryId, type, amount, paymentMethod]
  );
  return result.insertId;
};

const getCategoryIdByName = async (categoryName) => {
  const [rows] = await db.query(
    'SELECT category_id FROM spending_categories WHERE category_name = ?',
    [categoryName]
  );
  return rows[0]?.category_id;
};

const getRecentTransactions = async (userId, limit = 10) => {
  const [rows] = await db.query(
    `SELECT t.transaction_id, t.amount, t.transaction_type, t.status, t.transaction_date,
            sc.category_name
     FROM transactions t
     JOIN spending_categories sc ON t.category_id = sc.category_id
     WHERE t.user_id = ?
     ORDER BY t.transaction_date DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows;
};

const getTotalSpending = async (userId) => {
  const [rows] = await db.query(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE user_id = ? AND status = "success"',
    [userId]
  );
  return rows[0].total;
};

const getCategoryWiseSpending = async (userId) => {
  const [rows] = await db.query(
    `SELECT sc.category_name, SUM(t.amount) AS total
     FROM transactions t
     JOIN spending_categories sc ON t.category_id = sc.category_id
     WHERE t.user_id = ? AND t.status = 'success'
     GROUP BY sc.category_name`,
    [userId]
  );
  return rows;
};

const getMonthlySpendingTrend = async (userId) => {
  const [rows] = await db.query(
    `SELECT DATE_FORMAT(transaction_date, '%Y-%m') AS month, SUM(amount) AS total
     FROM transactions
     WHERE user_id = ? AND status = 'success'
     GROUP BY month
     ORDER BY month ASC`,
    [userId]
  );
  return rows;
};

const getRechargeVsBillTotals = async (userId) => {
  const [rows] = await db.query(
    `SELECT transaction_type, SUM(amount) AS total
     FROM transactions
     WHERE user_id = ? AND status = 'success'
     GROUP BY transaction_type`,
    [userId]
  );
  return rows;
};

module.exports = {
  createTransaction,
  getCategoryIdByName,
  getRecentTransactions,
  getTotalSpending,
  getCategoryWiseSpending,
  getMonthlySpendingTrend,
  getRechargeVsBillTotals
};