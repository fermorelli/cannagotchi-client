import Joi from "joi";

export const schema = Joi.object({
    email: Joi.string()
    .required()
    .pattern(new RegExp(/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/))
    .messages({
        'string.empty': 'This field is required',
        'string.pattern.base': 'Not a valid email format'
    }),
    password: Joi.string()
    .min(8)
    .max(10)
    .pattern(new RegExp(/^(?=.*?\d)(?=.*?[a-zA-Z])[a-zA-Z\d]+$/))
    .required()
    .messages({
        'string.min': 'Password must contain at least 8 digits',
        'string.max': `Password can't contain more than 10 digits`,
        'string.pattern.base': 'Password should contain at least 1 number and at least 1 letter',
        'string.empty': 'This field is required'
    })
})