const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    userEmail: { type: String, required: true },
    address: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    paymentMethod: { type: String, default: "COD" },
    items: [
        {
            title: String,
            price: Number,
            quantity: Number
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);