import Joi from 'joi';

// Define the Joi schema for user registration
exports.userRegisterSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_+=-]*$/)
    .required()
    .messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 30 characters',
      'string.pattern.base': 'Password contains invalid characters',
      'any.required': 'Password is required',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Password and Confirm Password must match',
      'any.required': 'Confirm Password is required',
    }),

  firstName: Joi.string().required().min(2).max(50).messages({
    'string.base': 'First name must be a string',
    'string.empty': 'First name cannot be empty',
    'any.required': 'First name is required',
  }),

  lastName: Joi.string().required().min(2).max(50).messages({
    'string.base': 'Last name must be a string',
    'string.empty': 'Last name cannot be empty',
    'any.required': 'Last name is required',
  }),
});

// User login schema
export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })  // Ensures a valid email address without restricting specific domains
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(6)  // Password must be at least 6 characters long (you can adjust this length as needed)
    .required()
    .messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 6 characters long',  // You can adjust this based on your password policy
      'any.required': 'Password is required'
    })
});

