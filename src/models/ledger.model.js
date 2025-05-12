import mongoose, { Schema } from "mongoose";

const ledgerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Transaction initiator
    username: { type: String }, // Username for easier identification
    role: { type: String, enum: ['admin', 'superFranchisee', 'franchisee', 'subFranchisee'] }, // Role of the user
    transactionId: { type: String, required: true }, // Unique ID for the transaction
    amount: { type: Number, required: true }, // Amount credited or debited
    type: { type: String, enum: ['credit', 'debit'], required: true }, // Transaction type
    balanceAfterTransaction: { type: Number, required: true }, // Wallet balance after this transaction
    description: { type: String }, // Description or reason for the transaction
    remarks: { type: String }, // Optional remarks
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' }, // Linking to the test
    testName: { type: String }, // Name of the test for quick reference
    receivedFrom: { type: String}, // Username of the child user
    commission: { 
        amount: { type: Number }, // Commission amount
        fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who paid the commission
        fromUserRole: { type: String, enum: ['superFranchisee', 'franchisee', 'subFranchisee'] }, // Payer's role
        toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who received the commission
        toUserRole: { type: String, enum: ['superFranchisee', 'franchisee', 'subFranchisee'] }, // Receiver's role
    },
    testDetails: [
        {
            testName: String,
            testPrice: Number,
            commissionAmount: Number,
        }
    ],
    sampleBarcodeId: [String] , // New field for Sample Barcode ID
    patientName: { type: String }, // New field for Patient's Name
    createdAt: { type: Date, default: Date.now }, // Transaction timestamp
    updatedAt: { type: Date, default: Date.now }, // Optional: Update timestamp
});

// Export the model
export const Ledger = mongoose.model('Ledger', ledgerSchema);
