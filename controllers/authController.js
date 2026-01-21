const User = require('../models/User'); 
const { OAuth2Client } = require('google-auth-library');
const admin = require("firebase-admin"); 
const fs = require('fs');
const SibApiV3Sdk = require('sib-api-v3-sdk'); // <--- NEW LIBRARY
require('dotenv').config();

// --- FIREBASE INITIALIZATION ---
const localPath = './serviceAccountKey.json'; 
const renderPath = '/etc/secrets/serviceAccountKey.json'; 

let serviceAccount;
try {
    if (fs.existsSync(renderPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(renderPath));
    } else if (fs.existsSync(localPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(localPath));
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

// 2. Google Client Config
const GOOGLE_CLIENT_ID = "988012579412-sbnkvrl5makaebuvtv7jdho7su67edm3.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);


// --- 1. Send OTP Logic (VIA BREVO API - PORT 443) ---
const sendOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Configure API Key
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_PASS; // Using the 'xkeysib' key

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Your Login Verification Code";
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Flavor Fetch Verification</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <h1 style="color: #FF7A30; letter-spacing: 5px;">${otp}</h1>
            <p>This code is valid for 10 minutes.</p>
        </div>`;
    sendSmtpEmail.sender = { "name": "Flavor Fetch", "email": process.env.EMAIL_USER };
    sendSmtpEmail.to = [{ "email": email }];

    try {
        console.log(`Attempting to send OTP to ${email} via API...`);
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`OTP sent successfully to ${email}`);
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("API Email error:", error);
        res.status(500).json({ error: "Failed to send email via API" });
    }
};


// --- 2. Google Login Logic ---
const googleLogin = async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: GOOGLE_CLIENT_ID, 
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (user) {
            console.log("Google User Login:", email);
            res.status(200).json({ 
                message: "Login Success", 
                user: { email: user.email, name: user.name, _id: user._id } 
            });
        } else {
            console.log("Creating new Google User:", email);
            user = new User({
                name: name,
                email: email,
                password: "",
                isGoogleUser: true
            });
            await user.save();
            res.status(201).json({ 
                message: "User Created", 
                user: { email: user.email, name: user.name, _id: user._id } 
            });
        }

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(400).json({ message: "Invalid Google Token" });
    }
};


// --- 3. OTP Login ---
const otpLogin = async (req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });
        
        if (!user) {
            console.log("Creating new OTP User in DB:", email);
            user = new User({
                name: "User", 
                email: email,
                password: "",
                isGoogleUser: false
            });
            await user.save();
        }

        let firebaseUid = email; 
        try {
            const firebaseUser = await admin.auth().getUserByEmail(email);
            firebaseUid = firebaseUser.uid;
        } catch (e) {
            const newFirebaseUser = await admin.auth().createUser({
                email: email,
                emailVerified: true
            });
            firebaseUid = newFirebaseUser.uid;
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

module.exports = { sendOtp, googleLogin, otpLogin };