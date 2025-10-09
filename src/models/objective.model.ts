import mongoose, { Schema } from "mongoose";
import { OBJECTIVE_ENUMS } from "../constants/objective.constant";

const objectiveSchema = new Schema(
  {
    topic: { type: String, required: true },
    session: { type: String, required: false },
    grade: { type: String, required: true },
    instructions: { type: String, required: false },
    subject: { type: String, required: false },
    title: { type: String, required: false },

    data: { type: [String], required: false },

    previousTopic: [{ type: String }],
    noOfExamples: { type: Number },

    moduleType: {
      type: String,
      enum: Object.values(OBJECTIVE_ENUMS),
      required: true,
    },

    createdBy: { type: String, required: false },
  },
  { timestamps: true }
);

const Objective = mongoose.model("Objective", objectiveSchema);

export default Objective;
