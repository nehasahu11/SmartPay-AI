// server.js
// Entry point for the SmartPay AI backend server

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ---------- Global Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Route Imports ----------
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const rechargeRoutes = require('./routes/rechargeRoutes');
const billRoutes = require('./routes/billRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const voiceRoutes = require('./routes/voiceRoutes');

// ---------- Mount Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/recharge', rechargeRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/voice', voiceRoutes);

// ---------- Health Check ----------
app.get('/', (req, res) => {
  res.json({ message: 'SmartPay AI Backend is running successfully' });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SmartPay AI server running on http://localhost:${PORT}`);
});