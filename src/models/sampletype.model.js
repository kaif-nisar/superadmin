import mongoose, { Schema } from "mongoose";

const sample = new Schema(
   {
    Name: {
        type: String,
    },
    createdby: Object
   },
  {
    timestamps: true,
  }
);

// Create the model
const sampleSchema = mongoose.model("sampleType", sample);

export { sampleSchema };