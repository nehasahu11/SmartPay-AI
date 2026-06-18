// controllers/transactionController.js
// Powers the dashboard widgets and analytics charts

const transactionModel = require('../models/transactionModel');
const insightsService = require('../services/insightsService');

// ---------- Recent Transactions Widget ----------
const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel.getRecentTransactions(req.user.user_id, 10);
    res.json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching transactions.' });
  }
};

// ---------- Total Spending Widget ----------
const getTotalSpending = async (req, res) => {
  try {
    const total = await transactionModel.getTotalSpending(req.user.user_id);
    res.json({ success: true, totalSpending: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching total spending.' });
  }
};

// ---------- Pie Chart Data: Category-wise Spending ----------
const getCategoryWiseSpending = async (req, res) => {
  try {
    const data = await transactionModel.getCategoryWiseSpending(req.user.user_id);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching category spending.' });
  }
};

// ---------- Line Chart Data: Monthly Spending Trend ----------
const getMonthlySpendingTrend = async (req, res) => {
  try {
    const data = await transactionModel.getMonthlySpendingTrend(req.user.user_id);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching monthly trend.' });
  }
};

// ---------- Bar Chart Data: Recharge vs Bill Payments ----------
const getRechargeVsBillTotals = async (req, res) => {
  try {
    const data = await transactionModel.getRechargeVsBillTotals(req.user.user_id);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching recharge vs bill totals.' });
  }
};

// ---------- AI Spending Insights ----------
const getSpendingInsights = async (req, res) => {
  try {
    const transactions = await transactionModel.getRecentTransactions(req.user.user_id, 200);
    const insights = await insightsService.runInsights(transactions);
    res.json({ success: true, insights });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error generating spending insights.' });
  }
};

module.exports = {
  getRecentTransactions,
  getTotalSpending,
  getCategoryWiseSpending,
  getMonthlySpendingTrend,
  getRechargeVsBillTotals,
  getSpendingInsights
};