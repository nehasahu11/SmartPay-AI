// routes/billRoutes.js

const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/pay', authMiddleware, billController.payBill);
router.get('/history', authMiddleware, billController.getBillHistory);
router.get('/upcoming', authMiddleware, billController.getUpcomingBills);

module.exports = router;