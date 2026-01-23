const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    paymentId: { type: String, default: "N/A" },
    failureReason: { type: String, default: "None" },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);