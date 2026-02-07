const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    // 🟢 OPTIMIZATION 1: Index userEmail
    // MongoDB will create a "lookup table" for emails, making search instant.
    userEmail: { type: String, required: true, index: true },

    address: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    
    // 🟢 OPTIMIZATION 2: Index status
    // Makes the Admin App's "Running" vs "Completed" tabs load much faster.
    status: { type: String, default: "Pending", index: true },
    
    paymentMethod: { type: String, default: "COD" },
    items: [
        {
            title: String,
            price: Number,
            quantity: Number
        }
    ]
}, { timestamps: true });

// 🟢 OPTIMIZATION 3: Compound Index
// This specifically speeds up the query: "Find all Pending orders for this User"
orderSchema.index({ userEmail: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);