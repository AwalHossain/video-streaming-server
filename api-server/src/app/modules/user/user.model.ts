// user model

import { Schema, model } from 'mongoose';


const userSchema = new Schema({
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


export const User = model('User', userSchema)