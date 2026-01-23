const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Success', 'Failed'], required: true },
    paymentId: { type: String }, // Razorpay Payment ID (if available)
    failureReason: { type: String }, // Error message if failed
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);