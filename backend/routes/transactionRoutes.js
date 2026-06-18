// routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/recent', authMiddleware, transactionController.getRecentTransactions);
router.get('/total-spending', authMiddleware, transactionController.getTotalSpending);
router.get('/category-spending', authMiddleware, transactionController.getCategoryWiseSpending);
router.get('/monthly-trend', authMiddleware, transactionController.getMonthlySpendingTrend);
router.get('/recharge-vs-bill', authMiddleware, transactionController.getRechargeVsBillTotals);
router.get('/insights', authMiddleware, transactionController.getSpendingInsights);

module.exports = router;