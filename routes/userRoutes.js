const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Address = require("../models/Address");
const connectDB = require('../config/db'); // ✅ Import Connection

// Keep your existing Address logic (if you want to keep using the controller)
const { saveAddress, getAddress } = require('../controllers/userController');
router.post('/address', saveAddress);
router.get('/address', getAddress);


// --- 1. GET USER PROFILE ---
router.get('/get-profile', async (req, res) => {
    await connectDB(); // 🟢 ADDED THIS
    try {
        const email = req.query.email;
        if (!email) return res.status(400).json("Email is required");

        const user = await User.findOne({ email: email });

        if (!user) {
            // Return empty strings if user not found (avoids Android crash)
            return res.status(200).json({ 
                name: "", phone: "", bio: "", profileImage: "" 
            });
        }

        // Return user data (excluding password)
        const { password, ...others } = user._doc;
        res.status(200).json(others);

    } catch (err) {
        res.status(500).json(err);
    }
});


// --- 2. UPDATE PROFILE ---
router.post('/update-profile', async (req, res) => {
    await connectDB(); // 🟢 ADDED THIS
    try {
        // Find user by email and update fields. 
        // "upsert: true" creates the user if they don't exist yet.
        const updatedUser = await User.findOneAndUpdate(
            { email: req.body.email },
            {
                $set: {
                    name: req.body.name,
                    phone: req.body.phone,
                    bio: req.body.bio,
                    profileImage: req.body.profileImage
                }
            },
            { new: true, upsert: true }
        );

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json(err);
    }
});


// --- 3. GET ADDRESSES ---
router.get("/get-address", async (req, res) => {
  await connectDB(); // 🟢 ADDED THIS
  try {
    const { email } = req.query; // Get email from URL params

    if (!email) {
      return res.status(400).json({ status: "error", message: "Email is required" });
    }

    // Find all addresses belonging to this email
    const addresses = await Address.find({ email: email });

    // ✅ CRITICAL: Return data inside a "data" key to match Android code
    res.json({
      status: "ok",
      data: addresses 
    });

  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});


// --- 4. ADD ADDRESS ---
router.post("/add-address", async (req, res) => {
  await connectDB(); // 🟢 ADDED THIS
  try {
    const { userEmail, address, city, zip, apartment, type } = req.body;

    const newAddress = new Address({
      email: userEmail,
      cityState: address, // This matches Android 'address' (District/State)
      street: city,      // This matches Android 'city' (Street name)
      postCode: zip,
      apartment: apartment,
      type: type || "Home"
    });

    await newAddress.save();
    res.json({ status: "ok", message: "Address saved successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


// --- 5. UPDATE ADDRESS ---
router.put("/update-address/:id", async (req, res) => {
  await connectDB(); // 🟢 ADDED THIS
  try {
    const { address, city, zip, apartment, type } = req.body;
    
    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          cityState: address,
          street: city,
          postCode: zip,
          apartment: apartment,
          type: type
        }
      },
      { new: true }
    );
    res.json({ status: "ok", data: updatedAddress });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


// --- 6. DELETE ADDRESS ---
router.delete("/delete-address/:id", async (req, res) => {
  await connectDB(); // 🟢 ADDED THIS
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ status: "ok", message: "Deleted" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});


// --- 7. SET DEFAULT ADDRESS ---
router.put("/set-default/:id", async (req, res) => {
    await connectDB(); // 🟢 ADDED THIS
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        // 1. Reset: Set isDefault to false for all addresses of this user
        await Address.updateMany({ email: email }, { $set: { isDefault: false } });

        // 2. Assign: Set isDefault to true for the specific selected ID
        const updated = await Address.findByIdAndUpdate(
            req.params.id, 
            { $set: { isDefault: true } }, 
            { new: true }
        );

        res.json({ status: "ok", data: updated });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

module.exports = router;