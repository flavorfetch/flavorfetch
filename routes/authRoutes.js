const express = require('express');
const router = express.Router();
const connectDB = require('../config/db'); // 🟢 1. Import Connection

// IMPORT ALL 3 FUNCTIONS
const { sendOtp, googleLogin, otpLogin } = require('../controllers/authController');

// 🟢 2. WRAP ROUTES with DB Connection (The Vercel Fix)

// Send OTP
router.post('/send-otp', async (req, res) => {
    await connectDB();
    await sendOtp(req, res);
});

// Google Login
router.post('/google', async (req, res) => {
    await connectDB();
    await googleLogin(req, res);
});

// OTP Login
router.post('/otp-login', async (req, res) => {
    await connectDB();
    await otpLogin(req, res);
});

module.exports = router;