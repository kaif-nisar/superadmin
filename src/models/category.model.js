import mongoose, {Schema} from "mongoose"

const counterSchema = new Schema({
    _id: {
        type: String,
    },
     tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            default: null
          },
    sequence_value : {
        type: Number,
        unique: true
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the creator
})

const category = new Schema({
    orderId: {
        type: Number,
        unique: true
    },
     tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            default: null
          },
    category: {
        type: String,
        required: true
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the creator
})


const unit = new Schema({
    unit:{type:String},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the creator
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        default: null
      },
})

const unitdb = mongoose.model('unitdb',unit);

const categorydb = mongoose.model("categorydb", category) 
const Counter = mongoose.model("counter", counterSchema)

export {Counter, categorydb, unitdb}