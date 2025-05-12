// tenant.model.js
import mongoose, { Schema } from "mongoose";

const tenantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    modelType: {
      type: String,
      enum: ["4layer", "3layer", "2layer", "1layer"],
      required: true,
    },
    // Reference to tests purchased from SuperAdmin
    purchasedTests: [
      {
        testId: { type: mongoose.Schema.Types.ObjectId, ref: "testSchema" },
        purchaseDate: { type: Date, default: Date.now },
        price: Number,
      },
    ],
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    adminDetails: {
      email: String,
      username: String,
      userId: { type: Schema.Types.ObjectId, ref: "User" },
    },
    subscriptionPlan: {
      planType: {
        type: String,
        enum: ["monthly", "quarterly", "yearly"],
        default: "monthly",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "overdue"],
        default: "pending",
      },
    },
    analytics: {
      totalUsers: { type: Number, default: 0 },
      totalTests: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      monthlyRevenue: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Tenant = mongoose.model("Tenant", tenantSchema);
