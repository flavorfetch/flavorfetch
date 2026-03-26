const Order = require('../models/Order');
const User = require('../models/User');
const connectDB = require('../config/db');
const admin = require('firebase-admin');

const createOrder = async (req, res) => {
    await connectDB();

    try {
        const { userEmail, address, totalPrice, items, status, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        const newOrder = new Order({
            userEmail,
            address,
            totalPrice,
            items,
            status: status || "Pending",
            paymentMethod: paymentMethod || "COD"
        });

        const savedOrder = await newOrder.save();

        res.status(201).json(savedOrder);

    } catch (error) {
        res.status(500).json({ message: "Failed to place order" });
    }
};

const getOrders = async (req, res) => {
    await connectDB();

    try {
        const { email } = req.query;

        let orders;
        if (email) {
            orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
        } else {
            orders = await Order.find().sort({ createdAt: -1 });
        }
        
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

const getLatestOrder = async (req, res) => {
    await connectDB();

    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const order = await Order.findOne({ userEmail: email }).sort({ createdAt: -1 });

        if (!order) {
            return res.status(404).json({ message: "No active orders found" });
        }

        res.status(200).json({
            orderId: order._id,
            status: order.status, 
            totalPrice: order.totalPrice,
            items: order.items
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const getOrderById = async (req, res) => {
    await connectDB();
    const { id } = req.params;

    try {
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            orderId: order._id,
            status: order.status,
            totalPrice: order.totalPrice,
            items: order.items
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const updateOrderStatus = async (req, res) => {
    await connectDB();
    
    try {
        const orderId = req.body.orderId || req.body._id;
        const { status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ message: "Order ID and Status are required" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        const user = await User.findOne({ email: updatedOrder.userEmail });

        if (user && user.fcmToken && admin.apps.length > 0) {
            let title = "Order Update";
            let body = `Your order status is now: ${status}`;

            if (status === "Preparing") {
                title = "Chef is on it! 👨‍🍳";
                body = "Your food is currently being prepared.";
            } else if (status === "Out for Delivery") {
                title = "Food is on the way! 🛵";
                body = "Your delivery partner has picked up your order.";
            } else if (status === "Delivered") {
                title = "Delivered! 📦";
                body = "Enjoy your meal!";
            }

            const message = {
                notification: {
                    title: title,
                    body: body
                },
                token: user.fcmToken
            };

            await admin.messaging().send(message);
        }

        res.status(200).json({ message: "Status Updated", order: updatedOrder });

    } catch (error) {
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

module.exports = { 
    createOrder, 
    getOrders, 
    getLatestOrder, 
    getOrderById,
    updateOrderStatus
};