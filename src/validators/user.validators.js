const Joi = require('joi');

const email = Joi.string().trim().lowercase().email().required();
const otp = Joi.string().pattern(/^\d{6}$/).required().messages({
  'string.pattern.base': '"otp" must be a 6-digit code',
});

const signUpSchema = Joi.object({
  firstname: Joi.string().trim().min(2).max(50).required(),
  lastname: Joi.string().trim().min(2).max(50).required(),
  email,
  password: Joi.string().min(8).max(64).required(),
});

const loginSchema = Joi.object({
  email,
  password: Joi.string().required(),
});

const verifyOtpSchema = Joi.object({ email, otp });

const forgotPasswordSchema = Joi.object({ email });

const resetPasswordSchema = Joi.object({
  email,
  otp,
  newPassword: Joi.string().min(8).max(64).required(),
});

const updateProfileSchema = Joi.object({
  firstname: Joi.string().trim().min(2).max(50),
  lastname: Joi.string().trim().min(2).max(50),
}).or('firstname', 'lastname');

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(64)
    .invalid(Joi.ref('currentPassword'))
    .required()
    .messages({
      'any.invalid': '"newPassword" must be different from the current password',
    }),
});

module.exports = {
  signUpSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
};