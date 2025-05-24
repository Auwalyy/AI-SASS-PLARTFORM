// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    clerkUserId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: String,
    lastName: String,
    username: String,
    profileImage: String,
    lastSignedIn: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to update the updatedAt field
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;