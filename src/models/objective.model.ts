import mongoose, { Schema } from "mongoose";

const objectiveSchema = new Schema(
  {
    topic: { type: String, required: true },
    grade: { type: String, required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true }, // optional descriptive title
    objectives: [{ type: String, required: true }], // store array of generated objectives
    createdBy: { type: String, required: false }, // optional (userId/teacherId)
  },
  { timestamps: true }
);

const Objective = mongoose.model("objective", objectiveSchema);

export default Objective;
