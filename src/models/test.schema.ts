import mongoose, { Schema } from "mongoose";

const testSchema = new Schema(
  {
    name: String,
    age: Number,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Test = mongoose.model("test", testSchema);

export default Test;
