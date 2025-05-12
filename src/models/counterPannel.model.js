import mongoose,{Schema} from "mongoose";

const PannelCounterSchema = new Schema({
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

const pannelCounter = mongoose.model('pannelCounter', PannelCounterSchema);

export {pannelCounter}