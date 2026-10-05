import Joi from 'joi';

export const schema = Joi.object({
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
        .max(128)
        .required()
        .messages({
            'string.max': 'Password must contain at most 128 characters',
            'string.empty': 'This field is required',
            'any.required': 'This field is required',
            'string.base': 'Enter a valid value',
        }),
});
