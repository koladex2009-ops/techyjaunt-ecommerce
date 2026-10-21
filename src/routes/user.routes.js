const express = require('express');
const router = express.Router();
const {
  signUp,
  login,
  sendOtp,
  verifyOtp,
  resendOtp, 
  forgotPassword, 
  resetPassword,
  getProfile,
} = require('../controllers/user.controllers');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middlewares');
const {
  signUpSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/user.validators');

router.post('/signup', validate(signUpSchema), signUp);
router.post('/login', validate(loginSchema), login);
router.post('/send-otp/:id', sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/resend-otp/:id', resendOtp);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/profile', authenticate, getProfile);

module.exports = router;