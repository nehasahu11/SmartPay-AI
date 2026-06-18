// routes/rechargeRoutes.js

const express = require('express');
const router = express.Router();
const rechargeController = require('../controllers/rechargeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, rechargeController.createRecharge);
router.get('/history', authMiddleware, rechargeController.getRechargeHistory);

module.exports = router;