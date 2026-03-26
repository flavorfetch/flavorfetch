const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Address = require("../models/Address");
const connectDB = require('../config/db');

const { 
    saveAddress, 
    getAddress, 
    getAllUsers, 
    deleteUserById,
    updateUserById,
    updateToken
} = require('../controllers/userController');

router.post('/address', saveAddress);
router.get('/address', getAddress);

router.post('/update-token', updateToken);

router.get('/get-profile', async (req, res) => {
    await connectDB();
    try {
        const email = req.query.email;
        if (!email) return res.status(400).json("Email is required");

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(200).json({ 
                name: "", phone: "", bio: "", profileImage: "" 
            });
        }

        const { password, ...others } = user._doc;
        res.status(200).json(others);

    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/update-profile', async (req, res) => {
    await connectDB();
    try {
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
        console.error(err);
        res.status(500).json(err);
    }
});

router.get("/get-address", async (req, res) => {
  await connectDB();
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ status: "error", message: "Email is required" });

    const addresses = await Address.find({ email: email });
    res.json({ status: "ok", data: addresses });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

router.post("/add-address", async (req, res) => {
  await connectDB();
  try {
    const { userEmail, address, city, zip, apartment, type } = req.body;
    const newAddress = new Address({
      email: userEmail,
      cityState: address,
      street: city,
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

router.put("/update-address/:id", async (req, res) => {
  await connectDB();
  try {
    const { address, city, zip, apartment, type } = req.body;
    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      {
        $set: { cityState: address, street: city, postCode: zip, apartment: apartment, type: type }
      },
      { new: true }
    );
    res.json({ status: "ok", data: updatedAddress });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.delete("/delete-address/:id", async (req, res) => {
  await connectDB();
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ status: "ok", message: "Deleted" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.put("/set-default/:id", async (req, res) => {
    await connectDB();
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        await Address.updateMany({ email: email }, { $set: { isDefault: false } });
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

router.delete('/delete-account', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const deletedUser = await User.findOneAndDelete({ email: email });
        if (!deletedUser) return res.status(404).json({ error: "User not found" });

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

router.get('/', async (req, res) => {
    await connectDB();
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete('/:id', async (req, res) => {
    await connectDB();
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put('/:id', async (req, res) => {
    await connectDB();
    await updateUserById(req, res);
});

module.exports = router;