import mongoose from "mongoose";

const profileSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    displayName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    about: { type: String, trim: true, default: "" },
    profileImageUrl: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
  }
);

const ProfileSettings = mongoose.model("ProfileSettings", profileSettingsSchema);
export default ProfileSettings;

