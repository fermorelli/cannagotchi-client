import Joi from 'joi';

export const schema = Joi.object({
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.empty': 'This field is required',
            'string.email': 'Not a valid email format',
        }),
    password: Joi.string()
        .max(72)
        .required()
        .messages({
            'string.max': "Password can't contain more than 72 characters",
            'string.empty': 'This field is required',
        }),
});
