import Joi from 'joi';

export const schema = Joi.object({
    firstName: Joi.string()
        .min(3)
        .required()
        .pattern(new RegExp(/^[A-Za-z]+$/))
        .messages({
            'string.min': 'Use at least 3 letters for the first name.',
            'string.empty': 'Enter a first name.',
            'any.required': 'Enter a first name.',
            'string.base': 'Enter a first name.',
            'string.pattern.base': 'Use letters only for the first name.',
        }),
    lastName: Joi.string()
        .min(3)
        .required()
        .pattern(new RegExp(/^[A-Za-z]+$/))
        .messages({
            'string.min': 'Use at least 3 letters for the last name.',
            'string.empty': 'Enter a last name.',
            'any.required': 'Enter a last name.',
            'string.base': 'Enter a last name.',
            'string.pattern.base': 'Use letters only for the last name.',
        }),
    email: Joi.string()
        .required()
        .pattern(new RegExp(/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/))
        .messages({
            'string.empty': 'Enter an email address.',
            'any.required': 'Enter an email address.',
            'string.base': 'Enter an email address.',
            'string.pattern.base': 'Enter a valid email address, such as you@example.com.',
        }),
});
