// models/superAdmin.model.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const superAdminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
    },
    phoneNo: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

superAdminSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

superAdminSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

superAdminSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            role: "superAdmin"
        },
        process.env.SUPER_ADMIN_ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

superAdminSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.SUPER_ADMIN_REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);