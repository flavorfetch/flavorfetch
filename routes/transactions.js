const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const connectDB = require('../config/db'); // 👈 Import the connection

// GET: Fetch user history
router.get('/', async (req, res) => {
    try {
        await connectDB(); // 👈 VITAL: Wait for connection before querying!
        
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const history = await Transaction.find({ userEmail: email }).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        console.error("Transaction Fetch Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST: Log a transaction
router.post('/log-transaction', async (req, res) => {
    try {
        await connectDB(); // 👈 VITAL: Wait for connection before saving!

        const { userEmail, amount, status, paymentId, failureReason } = req.body;
        const newTransaction = new Transaction({
            userEmail, amount, status, paymentId, failureReason
        });

        await newTransaction.save();
        res.status(201).json({ message: "Transaction Logged" });
    } catch (error) {
        console.error("Transaction Log Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;