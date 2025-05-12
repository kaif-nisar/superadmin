import mongoose, { Schema } from "mongoose";

const defaultresultSchema = new Schema({
  gender: String,
  minAge: String,
  minAgeUnit: String,
  maxAge: String,
  maxAgeUnit: String,
  lowerValue: String,
  upperValue: String,
});

const parameterSchema = new Schema({
  order: Number,
  Para_name: String,
  unit: String,
  groupby: String,
  defaultresult: String,
  NormalValue: [defaultresultSchema],
  text: String,
  ValueType: String,
});

const TestSchema = new Schema(
  {
    order: {
      type: String,
      default: 0,
    },
    Name: {
      type: String,
      required: true,
    },
    Short_name: {
      type: String,
    },
    category: {
      type: String,
    },
    Price: {
      type: Number,
      required: true,
    },
    final_price: {
      type: Number,
      required: true,
    },
    parameters: [parameterSchema],
    sampleType: {
      type: String,
      enum: [
        "SERUM",
        "EDTA",
        "FLOURISHED",
        "URINE",
        "Sodium Citrate",
        "Sodium Heparin",
        "Lithium Heparin",
      ],
      required: true,
    },
    method: String,
    instrument: String,
    interpretation: String,
    isDocumentedTest: {
      type: Boolean,
      default: false,
    },

    // Multi-tenant fields
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        // Sirf SuperAdmin ke liye optional hai
        return this.createdByRole !== "superAdmin";
      },
      default: null, // Default to null for SuperAdmin tests
      index: true, // For faster queries by tenant
    },
    createdByRole: {
      type: String,
      enum: ["superAdmin", "admin"], // Role of the user who created the test
    },
    // Fields for test ownership and rental management
    isBaseTest: {
      type: Boolean,
      default: false, // True if created by SuperAdmin as a template
    },

    // If this test was rented/purchased from the SuperAdmin
    purchasedFromBaseTest: {
      type: Boolean,
      default: false,
    },

    // Reference to original test if purchased/rented
    originalTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "testSchema",
    },

    // For SuperAdmin tests: which tenants have purchased this test
    purchasedBy: [
      {
        tenantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        purchaseDate: {
          type: Date,
          default: Date.now,
        },
        purchasePrice: Number,
      },
    ],

    assignedPrices: [
      {
        userId: mongoose.Schema.Types.ObjectId, // Assignee (Franchisee or Subfranchisee)
        assignedBy: mongoose.Schema.Types.ObjectId, // Assigner (Admin, Superfranchisee, or Franchisee)
        price: Number, // Price set during assignment
        commission: Number, // Commission for the assigner
        assignedAt: { type: Date, default: Date.now }, // Timestamp
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

TestSchema.index({ Name: 1, tenantId: 1 }, { unique: true });

// Create the model
const testSchema =
  mongoose.models.testSchema || mongoose.model("testSchema", TestSchema);

export { testSchema };
