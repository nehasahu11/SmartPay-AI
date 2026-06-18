// controllers/billController.js

const billModel = require('../models/billModel');
const transactionModel = require('../models/transactionModel');

const CATEGORY_MAP = {
  electricity: 'Electricity Bill',
  water: 'Water Bill',
  gas: 'Gas Bill',
  broadband: 'Broadband Bill'
};

// ---------- Pay Bill (handles electricity / water / gas / broadband) ----------
const payBill = async (req, res) => {
  try {
    const { billType, providerName, consumerNumber, billingMonth, dueDate, amount, paymentMethod } = req.body;
    const userId = req.user.user_id;

    if (!['electricity', 'water', 'gas', 'broadband'].includes(billType)) {
      return res.status(400).json({ success: false, message: 'Invalid bill type.' });
    }

    const categoryName = CATEGORY_MAP[billType];
    const categoryId = await transactionModel.getCategoryIdByName(categoryName);

    const transactionId = await transactionModel.createTransaction(
      userId, categoryId, 'bill', amount, paymentMethod
    );

    const billId = await billModel.createBillPayment(
      transactionId, userId, billType, providerName, consumerNumber, billingMonth, dueDate
    );

    res.status(201).json({
      success: true,
      message: `${billType} bill payment successful.`,
      transactionId,
      billId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error processing bill payment.' });
  }
};

// ---------- Get Bill Payment History ----------
const getBillHistory = async (req, res) => {
  try {
    const bills = await billModel.getBillsByUser(req.user.user_id);
    res.json({ success: true, bills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching bill history.' });
  }
};

// ---------- Get Upcoming Bills (for dashboard widget) ----------
const getUpcomingBills = async (req, res) => {
  try {
    const upcoming = await billModel.getUpcomingBills(req.user.user_id);
    res.json({ success: true, upcoming });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching upcoming bills.' });
  }
};

module.exports = { payBill, getBillHistory, getUpcomingBills };