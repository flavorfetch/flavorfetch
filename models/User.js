const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        // 🟢 OPTIMIZATION 1: Index Name
        // Makes searching for users in the Admin App instant.
        index: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, // Automatically creates a Unique Index
        // 🟢 OPTIMIZATION 2: Data Sanitization
        // Prevents login issues by forcing lowercase and removing spaces.
        lowercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: false 
    },
    isGoogleUser: { 
        type: Boolean, 
        default: false 
    },
    phone: { 
        type: String, 
        default: "",
        // 🟢 OPTIMIZATION 3: Index Phone
        // Essential if you add "Login with Phone" later.
        index: true
    },
    bio: { 
        type: String, 
        default: "" 
    },
    profileImage: { 
        type: String, 
        default: "" 
    },
    address: {
        type: String,
        default: "" 
    }
}, { timestamps: true });

// 🟢 OPTIMIZATION 4: Text Search Index
// This allows the Admin App to perform "Smart Search" (finding "John" matches "Johnny").
userSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('User', userSchema);