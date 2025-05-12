import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    // New fields
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      require: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["admin", "superFranchisee", "franchisee", "subFranchisee"],
    },
    password: {
      type: String,
      require: [true, "password is required"],
      trim: true,
    },
    refreshToken: {
      type: String,
    },
    wallet: { type: Number, default: 0 }, // Initial balance for each user
    createdAt: { type: Date, default: Date.now },
    phoneNo: Number,
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    postOffice: {
      type: String,
    },
    pinCode: {
      type: String,
      trim: true,
      // required: true,
    },
    address: {
      type: String,
      // required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ledger: [
      {
        transactionId: String, // Unique Transaction ID
        type: { type: String, enum: ["credit", "debit"] }, // Credit/Debit
        amount: Number, // Transaction Amount
        description: String, // Description of transaction
        balanceAfterTransaction: Number, // Wallet balance after this transaction
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the creator
    createdUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users created by this user
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  // const role = await this._id.fin
  return jwt.sign(
    {
      _id: this._id,
      tenantId: this.tenantId,
      role: this.role,
    },
    process.env.SUPER_ADMIN_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.SUPER_ADMIN_REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
