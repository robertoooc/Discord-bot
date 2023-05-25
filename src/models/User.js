import mongoose from "mongoose";

const JobPostingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["waiting", "rejected", "accepted"],
      default: "waiting",
    },
    link: { type: String },
  },
  {
    timestamps: true,
  }
);

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  jobs: [JobPostingSchema],
});
export default mongoose.model("User", UserSchema);
