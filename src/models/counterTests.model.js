import mongoose,{Schema} from "mongoose";

const testCounterSchema = new Schema({
    _id: {
        type: String, // Counter name (e.g., "orderCounter")
        required: true
    },
    sequenceValue: {
        type: Number, // Current sequence value
        required: true,
        default: 0
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        default: null // Reference to the tenant (if applicable)
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the creator
});

const testCounter = mongoose.model('testCounter', testCounterSchema);

export {testCounter}