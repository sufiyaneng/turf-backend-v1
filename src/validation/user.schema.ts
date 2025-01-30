import Joi from "joi";

export const signupSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  turfName: Joi.string().required().messages({
    "any.required": "Turf Name is required.",
  }),
  password: Joi.string()
    .custom((value, helpers) => {
      if (!/[A-Z]/.test(value)) {
        return helpers.error("password.uppercase");
      }
      if (!/[a-z]/.test(value)) {
        return helpers.error("password.lowercase");
      }
      if (!/\d/.test(value)) {
        return helpers.error("password.number");
      }
      if (!/[@$!%*?&]/.test(value)) {
        return helpers.error("password.special");
      }
      if (value.length < 8) {
        return helpers.error("password.minLength");
      }
      return value; // Valid password
    })
    .required()
    .messages({
      "password.uppercase":
        "Password must contain at least one uppercase letter.",
      "password.lowercase":
        "Password must contain at least one lowercase letter.",
      "password.number": "Password must contain at least one number.",
      "password.special":
        "Password must contain at least one special character.",
      "password.minLength": "Password must be at least 8 characters long.",
      "any.required": "Password is required.",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string()
    .custom((value, helpers) => {
      if (!/[A-Z]/.test(value)) {
        return helpers.error("password.uppercase");
      }
      if (!/[a-z]/.test(value)) {
        return helpers.error("password.lowercase");
      }
      if (!/\d/.test(value)) {
        return helpers.error("password.number");
      }
      if (!/[@$!%*?&]/.test(value)) {
        return helpers.error("password.special");
      }
      if (value.length < 8) {
        return helpers.error("password.minLength");
      }
      return value;
    })
    .required()
    .messages({
      "password.uppercase":
        "Password must contain at least one uppercase letter.",
      "password.lowercase":
        "Password must contain at least one lowercase letter.",
      "password.number": "Password must contain at least one number.",
      "password.special":
        "Password must contain at least one special character.",
      "password.minLength": "Password must be at least 8 characters long.",
      "any.required": "Password is required.",
    }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
});

export const resetPasswordSchema = Joi.object({
  userId: Joi.string().required(),
  resetPassCode: Joi.string().required(),
  password: Joi.string()
    .custom((value, helpers) => {
      if (!/[A-Z]/.test(value)) {
        return helpers.error("password.uppercase");
      }
      if (!/[a-z]/.test(value)) {
        return helpers.error("password.lowercase");
      }
      if (!/\d/.test(value)) {
        return helpers.error("password.number");
      }
      if (!/[@$!%*?&]/.test(value)) {
        return helpers.error("password.special");
      }
      if (value.length < 8) {
        return helpers.error("password.minLength");
      }
      return value; // Valid password
    })
    .required()
    .messages({
      "password.uppercase":
        "Password must contain at least one uppercase letter.",
      "password.lowercase":
        "Password must contain at least one lowercase letter.",
      "password.number": "Password must contain at least one number.",
      "password.special":
        "Password must contain at least one special character.",
      "password.minLength": "Password must be at least 8 characters long.",
      "any.required": "Password is required.",
    }),
});
