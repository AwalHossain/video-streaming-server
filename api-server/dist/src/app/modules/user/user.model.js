"use strict";
// user model
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    password: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: ''
    },
    googleId: {
        type: String,
    },
}, {
    timestamps: true
});
exports.User = (0, mongoose_1.model)('User', userSchema);
