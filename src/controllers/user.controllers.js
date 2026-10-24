const User = require('../models/user.models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../helpers/email');
const renderTemplate = require('../helpers/renderTemplate');
require("dotenv").config()

const signUp = async (req, res) => {
  const {firstname, lastname, email, password} = req.body;
  try {
    if (!firstname || !lastname || !email || !password) {
  return res.status(400).json({message: "All fields are required"});
 };

 const hashedPassword = await bcrypt.hash(password, 10)
 const user = await User.findOne({email})
 if (user) {
  return res.status(400).json({message: "User already exists"});
 };

 const newUser = await User.create({
  firstname, lastname, email, password: hashedPassword,
 })
 return res.status(201).json({message: "User created successfully", user: newUser});
} catch (error) {
  console.log(error);
  return res.status(500).json({message: "Internal server error"})
}
};

const login = async (req, res) => {
  const {email, password} = req.body
  try {
    if (!email || !password) {
      return res.status(400).json({message: "All fields required"})
    };

  const user = await User.findOne({email});
  if (!user) {
    return res.status(400).json({message: "User not found"});
  };

  if (!user.isVerified) {
    return res.status(400).json({message: "User is not verified"})
  };

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({message: "Invalid Password"});
  };

  const token = jwt.sign(
    {id: user._id, email: user.email},
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

await sendEmail(
  user.email, "Someone just logged into your Account", "Someone just logged into your account" ).catch((error) => console.log("Login email failed:", error.message));
return res.status(200).json({message: "Login successful", user: user, token});
} catch (error) {
  console.log(error);
  return res.status(500).json({message: "Internal server error"});
}
};

const sendOtp = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({message: "User not found"})
    }
    const otp = Math.floor(100000 + Math.random() * 900000)
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    const html = await renderTemplate('otp', {
  name: user.firstname,
  message: 'Use the code below to verify your email address.',
  otp,
  expiresInMinutes: 10,
});
await sendEmail(user.email, "OTP for verification", `Your OTP is ${otp}`, html);
    return res.status(200).json({message: "OTP sent successfully"});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Internal server error"});
  };
};

const verifyOtp = async (req, res) => {
  const {email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    };

    const user = await User.findOne({email, otp: String(otp) });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    };
   
    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    };

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    };

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  };
};

const resendOtp = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    const html = await renderTemplate('otp', {
  name: user.firstname,
  message: 'Here is your new verification code.',
  otp,
  expiresInMinutes: 10,
});
await sendEmail(user.email, "Your OTP", `Your OTP is ${otp}`, html);

    return res.status(200).json({message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(400).json({ message: "User is not verified" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

const html = await renderTemplate('otp', {
  name: user.firstname,
  message: 'Use the code below to reset your password.',
  otp,
  expiresInMinutes: 10,
});
await sendEmail(user.email, "Password reset OTP", `Your password reset OTP is ${otp}`, html);

    return res.status(200).json({message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  };
};


const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP and new password are required" });
    }

    const user = await User.findOne({ email, otp: String(otp) });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstname, lastname } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstname, lastname },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiresAt');

    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signUp,
  login,
  sendOtp,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
};