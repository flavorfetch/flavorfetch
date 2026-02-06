const Order = require('../models/Order');
const connectDB = require('../config/db'); 

// 1. CREATE ORDER
const createOrder = async (req, res) => {
    await connectDB();

    try {
        console.log("--- ORDER REQUEST RECEIVED ---");
        const { userEmail, address, totalPrice, items, status } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        const newOrder = new Order({
            userEmail,
            address,
            totalPrice,
            items,
            status: status || "Pending"
        });

        const savedOrder = await newOrder.save();
        console.log("--- ORDER SAVED TO DB ---", savedOrder._id);

        res.status(201).json(savedOrder);

    } catch (error) {
        console.error("Order Save Error:", error);
        res.status(500).json({ message: "Failed to place order" });
    }
};

// 2. GET ORDERS (Dual Purpose: User & Admin)
const getOrders = async (req, res) => {
    await connectDB();

    try {
        const { email } = req.query;

        let orders;
        if (email) {
            // ✅ CASE A: User App (Returns only their orders)
            orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
        } else {
            // ✅ CASE B: Admin App (Returns ALL orders if no email sent)
            // This populates your "Incoming Orders" screen
            orders = await Order.find().sort({ createdAt: -1 });
        }
        
        res.status(200).json(orders);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

// 3. GET LATEST ORDER (For User Tracking)
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
        console.error("Tracking Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. GET SPECIFIC ORDER BY ID
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
        console.error("Get Order Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 🔴 5. UPDATE ORDER STATUS (For Admin App)
// 🔴 5. UPDATE ORDER STATUS (Fixed for Android Compatibility)
const updateOrderStatus = async (req, res) => {
    await connectDB();
    
    try {
        console.log("--- Update Status Request ---");
        console.log("Body:", req.body); // Debug log to see what Android sends

        // ✅ FIX: Check for 'orderId' OR '_id' (because Android sends '_id')
        const orderId = req.body.orderId || req.body._id;
        const { status } = req.body;

        if (!orderId || !status) {
            console.log("Missing ID or Status");
            return res.status(400).json({ message: "Order ID and Status are required" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true } // Returns the updated document
        );

        if (!updatedOrder) {
            console.log("Order not found in DB");
            return res.status(404).json({ message: "Order not found" });
        }

        console.log(`Success: Order ${orderId} updated to ${status}`);
        res.status(200).json({ message: "Status Updated", order: updatedOrder });

    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: "Server Error: " + error.message });
    }
};

module.exports = { 
    createOrder, 
    getOrders, 
    getLatestOrder, 
    getOrderById,
    updateOrderStatus // ✅ Don't forget to export this!
};