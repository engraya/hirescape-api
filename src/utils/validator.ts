import Joi from 'joi';

// Define the Joi schema for user registration
exports.userRegisterSchema = Joi.object({
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
    .min(8)  // Password must be at least 8 characters long
    .max(30)  // Optional: adjust to your preferred max length
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_+=-]*$/)  // Optional: validate for specific password patterns (e.g., no spaces)
    .required()
    .messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 30 characters',
      'string.pattern.base': 'Password contains invalid characters',
      'any.required': 'Password is required'
    })
});


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


  export const createPostSchema = Joi.object({
    title: Joi.string().required().min(3).max(50).required(),
    description: Joi.string().min(3).max(500).required(),
    userId: Joi.string().required()
  });


  export const updatePostSchema = Joi.object({
    title: Joi.string().required().min(3).max(50).required(),
    description: Joi.string().min(3).max(500).required(),
  });
