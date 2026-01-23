const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// POST: Log a transaction
router.post('/log-transaction', async (req, res) => {
    try {
        const { userEmail, amount, status, paymentId, failureReason } = req.body;
        const newTransaction = new Transaction({
            userEmail, amount, status, paymentId, failureReason
        });
        await newTransaction.save();
        res.status(201).json({ message: "Transaction Logged" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Fetch user history
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        const history = await Transaction.find({ userEmail: email }).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;