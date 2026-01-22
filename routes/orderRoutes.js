const express = require('express');
const router = express.Router();
const connectDB = require('../config/db'); // 🟢 1. Import Connection

// Import must match the exports from controller
const { createOrder, getOrders, getLatestOrder, getOrderById } = require('../controllers/orderController');

// 🟢 2. WRAP EVERY ROUTE to wait for DB Connection first

// Create Order
router.post('/', async (req, res) => {
    await connectDB(); // Wait for DB
    await createOrder(req, res); // Then run controller
});

// Get All Orders
router.get('/', async (req, res) => {
    await connectDB();
    await getOrders(req, res);
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