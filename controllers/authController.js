const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const admin = require("firebase-admin");
const fs = require('fs');
const { Resend } = require('resend');
require('dotenv').config();

// ---------------- RESEND INIT ----------------
const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------- FIREBASE INIT ----------------
const localPath = './serviceAccountKey.json';
const renderPath = '/etc/secrets/serviceAccountKey.json';

let serviceAccount;

try {
    if (fs.existsSync(renderPath)) {
        console.log("Loading Firebase key from Render secrets...");
        serviceAccount = JSON.parse(fs.readFileSync(renderPath));
    } else if (fs.existsSync(localPath)) {
        console.log("Loading Firebase key from local file...");
        serviceAccount = JSON.parse(fs.readFileSync(localPath));
    } else if (fs.existsSync("../serviceAccountKey.json")) {
        serviceAccount = JSON.parse(fs.readFileSync("../serviceAccountKey.json"));
    } else {
        console.error("CRITICAL: serviceAccountKey.json not found!");
    }

    if (serviceAccount && !admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin Initialized!");
    }

} catch (error) {
    console.error("Firebase Init Error:", error.message);
}

// ---------------- GOOGLE AUTH ----------------
const GOOGLE_CLIENT_ID =
    "988012579412-sbnkvrl5makaebuvtv7jdho7su67edm3.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// =================================================
// 1️⃣ SEND OTP (RESEND)
// =================================================
const sendOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
    }

    try {
        await resend.emails.send({
            from: "Flavor Fetch <onboarding@resend.dev>",
            to: email,
            subject: "Your Login Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Flavor Fetch Verification</h2>
                    <p>Your One-Time Password (OTP) is:</p>
                    <h1 style="color: #FF7A30; letter-spacing: 5px;">${otp}</h1>
                    <p>This code is valid for 10 minutes.</p>
                </div>
            `
        });

        console.log(`OTP sent to ${email}`);
        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("Resend Email Error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
};

// =================================================
// 2️⃣ GOOGLE LOGIN
// =================================================
const googleLogin = async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const { email, name } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                password: "",
                isGoogleUser: true
            });
            await user.save();
        }

        res.status(200).json({
            message: "Login Success",
            user: { email: user.email, name: user.name, _id: user._id }
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(400).json({ message: "Invalid Google Token" });
    }
};

// =================================================
// 3️⃣ OTP LOGIN (FIREBASE CUSTOM TOKEN)
// =================================================
const otpLogin = async (req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name: "User",
                email,
                password: "",
                isGoogleUser: false
            });
            await user.save();
        }

        let firebaseUid;

        try {
            const firebaseUser = await admin.auth().getUserByEmail(email);
            firebaseUid = firebaseUser.uid;
        } catch {
            const newUser = await admin.auth().createUser({
                email,
                emailVerified: true
            });
            firebaseUid = newUser.uid;
        }

        const customToken = await admin.auth().createCustomToken(firebaseUid);

        res.status(200).json({
            message: "Login Success",
            token: customToken,
            user: { email: user.email, name: user.name, _id: user._id }
        });

    } catch (error) {
        console.error("OTP Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ---------------- EXPORTS ----------------
module.exports = {
    sendOtp,
    googleLogin,
    otpLogin
};
