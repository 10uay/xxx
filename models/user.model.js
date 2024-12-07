import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: false,
    },
    mobile: {
      type: Number,
      require: false,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    id_card: {
      type: Number,
      required: true,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationCode: String,
    verificationCodeExpiresAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
