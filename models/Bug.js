import mongoose from "mongoose";

const BugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
      lowercase: true,
    },

    status: {
      type: String,
      enum: ["To do", "In progress", "Resolved", "Closed"],
      default: "To do",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bug", BugSchema);
