import Joi from 'joi';

const namePattern = /^[\p{L}' -]+$/u;

export const schema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .required()
        .pattern(namePattern)
        .messages({
            'string.min': 'Use at least 2 characters for the first name.',
            'string.empty': 'Enter a first name.',
            'any.required': 'Enter a first name.',
            'string.base': 'Enter a first name.',
            'string.pattern.base': 'Use letters, spaces, apostrophes or hyphens for the first name.',
        }),
    lastName: Joi.string()
        .trim()
        .min(2)
        .required()
        .pattern(namePattern)
        .messages({
            'string.min': 'Use at least 2 characters for the last name.',
            'string.empty': 'Enter a last name.',
            'any.required': 'Enter a last name.',
            'string.base': 'Enter a last name.',
            'string.pattern.base': 'Use letters, spaces, apostrophes or hyphens for the last name.',
        }),
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.empty': 'Enter an email address.',
            'any.required': 'Enter an email address.',
            'string.base': 'Enter an email address.',
            'string.email': 'Enter a valid email address, such as you@example.com.',
        }),
});
