// controllers/rechargeController.js

const rechargeModel = require('../models/rechargeModel');
const transactionModel = require('../models/transactionModel');

// Maps recharge_type to the spending_categories.category_name created in Phase 2 seed data
const CATEGORY_MAP = {
  mobile: 'Mobile Recharge',
  dth: 'DTH Recharge',
  fastag: 'Fastag Recharge'
};

// ---------- Create Recharge (handles mobile / dth / fastag) ----------
const createRecharge = async (req, res) => {
  try {
    const { rechargeType, operatorName, accountNumber, planDetails, amount, paymentMethod } = req.body;
    const userId = req.user.user_id;

    if (!['mobile', 'dth', 'fastag'].includes(rechargeType)) {
      return res.status(400).json({ success: false, message: 'Invalid recharge type.' });
    }

    const categoryName = CATEGORY_MAP[rechargeType];
    const categoryId = await transactionModel.getCategoryIdByName(categoryName);

    // Step 1: create the generic transaction record
    const transactionId = await transactionModel.createTransaction(
      userId, categoryId, 'recharge', amount, paymentMethod
    );

    // Step 2: create the recharge-specific record linked to that transaction
    const rechargeId = await rechargeModel.createRecharge(
      transactionId, userId, rechargeType, operatorName, accountNumber, planDetails
    );

    res.status(201).json({
      success: true,
      message: `${rechargeType.toUpperCase()} recharge successful.`,
      transactionId,
      rechargeId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error processing recharge.' });
  }
};

// ---------- Get Recharge History ----------
const getRechargeHistory = async (req, res) => {
  try {
    const recharges = await rechargeModel.getRechargesByUser(req.user.user_id);
    res.json({ success: true, recharges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching recharge history.' });
  }
};

module.exports = { createRecharge, getRechargeHistory };