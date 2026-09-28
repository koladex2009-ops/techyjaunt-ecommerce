const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: {type: Boolean, default: false},
    otp: {type: String, default: null, },
    otpExpiresAt: {type: Date, default: null }
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model('User', userSchema);

module.exports = User;