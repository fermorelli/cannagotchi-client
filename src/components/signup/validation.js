import Joi from 'joi';

const namePattern = /^[\p{L}' -]+$/u;

export const schema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .required()
        .pattern(namePattern)
        .messages({
            'string.min': 'First name must contain at least 2 letters',
            'string.empty': 'This field is required',
            'any.required': 'This field is required',
            'string.base': 'Enter a valid value',
            'string.pattern.base': 'Use letters, spaces, apostrophes or hyphens',
        }),
    lastName: Joi.string()
        .trim()
        .min(2)
        .required()
        .pattern(namePattern)
        .messages({
            'string.min': 'Last name must contain at least 2 letters',
            'string.empty': 'This field is required',
            'any.required': 'This field is required',
            'string.base': 'Enter a valid value',
            'string.pattern.base': 'Use letters, spaces, apostrophes or hyphens',
        }),
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.empty': 'This field is required',
            'any.required': 'This field is required',
            'string.base': 'Enter a valid value',
            'string.email': 'Enter a valid email address',
        }),
    password: Joi.string()
        .min(8)
        .max(72)
        .required()
        .messages({
            'string.min': 'Password must contain at least 8 characters',
            'string.max': "Password can't contain more than 72 characters",
            'string.empty': 'This field is required',
            'any.required': 'This field is required',
            'string.base': 'Enter a valid value',
        }),
});
