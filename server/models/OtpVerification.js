const mongoose = require("mongoose");

const OtpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  otp: {
    type: String, // Store hashed OTP
    required: true,
  },

  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000)// OTP expires in 10 minutes
  },

  isVerifiedAccount: {
    type: Boolean,
    default: false,
  },
});

const OtpVerification = mongoose.model("OtpVerification", OtpVerificationSchema);

module.exports = OtpVerification;
