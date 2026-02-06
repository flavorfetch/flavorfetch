const User = require('../models/User');
const connectDB = require('../config/db'); 

// 1. SAVE USER ADDRESS (For User App Profile)
const saveAddress = async (req, res) => {
    await connectDB();
    const { email, address } = req.body;

    console.log("--- Save Address Request ---", email);

    if (!email || !address) {
        return res.status(400).json({ message: "Email and Address are required" });
    }

    try {
        const user = await User.findOneAndUpdate(
            { email: email },
            { address: address },
            { new: true } 
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "Address updated successfully", 
            address: user.address 
        });

    } catch (error) {
        console.error("Save Address Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. GET USER ADDRESS (For User App Profile)
const getAddress = async (req, res) => {
    await connectDB();
    const { email } = req.query; 

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            address: user.address || "" 
        });

    } catch (error) {
        console.error("Get Address Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 🔴 3. GET ALL USERS (For Admin App Dashboard)
const getAllUsers = async (req, res) => {
    await connectDB();
    try {
        // Fetch all users, sorted by newest first
        // We exclude the password field for security
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        
        res.status(200).json(users);
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 🔴 4. DELETE USER BY ID (For Admin App Button)
const deleteUserById = async (req, res) => {
    await connectDB();
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateUserById = async (req, res) => {
    await connectDB();
    try {
        const { id } = req.params;
        const { name, phone } = req.body; // Add other fields if needed

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { name: name, phone: phone } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { 
    saveAddress, 
    getAddress, 
    getAllUsers,  
    deleteUserById,
    updateUserById   
};