const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');

// 🟢 Import the new 'updateOrderStatus' function
const { 
    createOrder, 
    getOrders, 
    getLatestOrder, 
    getOrderById, 
    updateOrderStatus // <--- ADD THIS
} = require('../controllers/orderController');

// 🟢 WRAP EVERY ROUTE to wait for DB Connection first

// Create Order
router.post('/', async (req, res) => {
    await connectDB();
    await createOrder(req, res);
});

// Get All Orders (For Admin Dashboard)
router.get('/', async (req, res) => {
    await connectDB();
    await getOrders(req, res);
});

// 🔴 NEW ROUTE: Update Order Status (For Admin App Buttons)
// Matches the Android call: @POST("orders/updateStatus")
router.post('/updateStatus', async (req, res) => {
    await connectDB();
    await updateOrderStatus(req, res);
});

// Get Latest Order
router.get('/latest', async (req, res) => {
    await connectDB();
    await getLatestOrder(req, res);
});

// Track Order by ID
router.get('/track/:id', async (req, res) => {
    await connectDB();
    await getOrderById(req, res);
});

module.exports = router;