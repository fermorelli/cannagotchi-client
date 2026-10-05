import Joi from 'joi';

const namePattern = /^(?=.*\p{L})[\p{L}\p{M}' -]+$/u;

export const schema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .pattern(namePattern)
        .messages({
            'string.min': 'First name must contain at least 2 characters',
            'string.max': 'First name must contain at most 100 characters',
            'string.empty': 'This field is required',
            'any.required': 'This field is required',
            'string.base': 'Enter a valid value',
            'string.pattern.base': 'Use letters, spaces, apostrophes or hyphens',
        }),
    lastName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .pattern(namePattern)
        .messages({
            'string.min': 'Last name must contain at least 2 characters',
            'string.max': 'Last name must contain at most 100 characters',
            'string.empty': 'This field is required',
            'any.required': 'This field is required',
            'string.base': 'Enter a valid value',
            'string.pattern.base': 'Use letters, spaces, apostrophes or hyphens',
        }),
    email: Joi.string()
        .trim()
        .lowercase()
        .max(254)
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.empty': 'This field is required',
            'any.required': 'This field is required',
            'string.base': 'Enter a valid value',
            'string.email': 'Enter a valid email address',
            'string.max': 'Email must contain at most 254 characters',
        }),
    password: Joi.string()
        .min(15)
        .max(128)
        .pattern(/\S/u)
        .required()
        .messages({
            'string.min': 'Use at least 15 characters, such as a unique passphrase',
            'string.max': 'Password must contain at most 128 characters',
            'string.pattern.base': 'Password cannot contain only spaces',
            'string.empty': 'This field is required',
            'any.required': 'This field is required',
            'string.base': 'Enter a valid value',
        }),
    confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref('password'))
        .messages({
            'any.only': 'Passwords do not match',
            'string.empty': 'Please confirm your password',
            'any.required': 'Please confirm your password',
            'string.base': 'Please confirm your password',
        }),
});
