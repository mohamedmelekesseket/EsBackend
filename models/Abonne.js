import mongoose from "mongoose";

const SubscribeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    confirmed: { type: Boolean, default: false }, // ✅ subscription status
    confirmationToken: { type: String } // ✅ temporary token for confirmation
  },
  { timestamps: true }
);

export default mongoose.model("Subscribes", SubscribeSchema);
