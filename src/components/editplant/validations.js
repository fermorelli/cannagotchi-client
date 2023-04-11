import Joi from 'joi';

export const schema = Joi.object({
    plantName: Joi.string()
    .required()
    .min(3)
    .max(20)
    .pattern(new RegExp(/^[a-zA-Z0-9_ ]*$/))
    .messages({
        'string.min': 'Plant name must contain at least 3 letters',
        'string.empty': 'This field is required',
        'string.pattern.base': 'Not a valid name'
    }),
    genetic: Joi.string()
    .required()
    .min(3)
    .messages({
        'string.min': 'Genetics must contain at least 3 letters',
        'string.empty': 'This field is required',
    }),
    growMode: Joi.string()
    .required()
    .messages({
        'string.empty': 'This field is required'
    }),
    date: Joi.string().isoDate()
    .required()
    .messages({
        'date.empty': 'This field is required',
    }),
    auto: Joi.boolean()
    .required()
})