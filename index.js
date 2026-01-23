const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
require('dotenv').config();

// ✅ 1. Import the Transaction Model (Ensure this file exists in models folder!)
const Transaction = require('./models/Transaction'); 

// Connect to DB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);

// ✅ 2. ADD THIS NEW ROUTE HERE
app.post('/api/log-transaction', async (req, res) => {
    try {
        const { userEmail, amount, status, paymentId, failureReason } = req.body;

        // Create the transaction record
        const newTransaction = new Transaction({
            userEmail,
            amount,
            status,
            paymentId: paymentId || "N/A",
            failureReason: failureReason || "None",
            date: new Date()
        });

        await newTransaction.save();
        
        console.log("Transaction Logged:", status); // See this in your server logs
        res.status(201).json({ message: "Transaction Logged Successfully" });

    } catch (error) {
        console.error("Error logging transaction:", error);
        res.status(500).json({ error: "Failed to log transaction" });
    }
});

// Keep-Alive Route
app.get('/keep-alive', (req, res) => {
    res.send('Server is awake!');
});

// Start Server (If running locally) - Only needed if not handled by Vercel wrapper
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;