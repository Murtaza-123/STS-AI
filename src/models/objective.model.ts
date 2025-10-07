import mongoose, { Schema } from "mongoose";

const objectiveSchema = new Schema(
  {
    topic: { type: String, required: true },
    session: { type: String, required: false },
    grade: { type: String, required: true },
    instructions: { type: String, required: false },
    subject: { type: String, required: false },
    title: { type: String, required: false },
    data: [{ type: String, required: true }],
    moduleType: {
      type: String,
      enum: Object.values(
        require("../constants/objective.constant").OBJECTIVE_ENUMS
      ),
      required: false,
    },

    createdBy: { type: String, required: false },
  },
  { timestamps: true }
);

const Objective = mongoose.model("objective", objectiveSchema);

export default Objective;
