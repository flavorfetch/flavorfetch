const Transaction = require('./models/Transaction');

// API to Log a Transaction (Success or Failure)
app.post('/api/log-transaction', async (req, res) => {
    try {
        const { userEmail, amount, status, paymentId, failureReason } = req.body;

        const newTransaction = new Transaction({
            userEmail,
            amount,
            status,
            paymentId: paymentId || "N/A",
            failureReason: failureReason || "None"
        });

        await newTransaction.save();

        res.status(201).json({ message: "Transaction Logged", data: newTransaction });
    } catch (error) {
        console.error("Error logging transaction:", error);
        res.status(500).json({ error: "Failed to log transaction" });
    }
});

// API to Get User's Transaction History
app.get('/api/transactions', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email required" });

        const history = await Transaction.find({ userEmail: email }).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch history" });
    }
});