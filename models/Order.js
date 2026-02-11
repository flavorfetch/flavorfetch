const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    userEmail: { type: String, required: true, index: true },
    address: { type: String, required: true },
    totalPrice: { type: Number, required: true },
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

orderSchema.index({ userEmail: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);