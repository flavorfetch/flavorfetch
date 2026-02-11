const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        index: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
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

userSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('User', userSchema);