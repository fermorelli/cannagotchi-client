import Joi from 'joi';

export const schema = Joi.object({
    plantName: Joi.string()
    .min(3)
    .required()
    .pattern(new RegExp(/^[a-zA-Z0-9_ ]*$/))
    .messages({
        'string.min': 'Use at least 3 characters for the plant name.',
        'string.empty': 'Enter a plant name.',
        'any.required': 'Enter a plant name.',
        'string.base': 'Enter a plant name.',
        'string.pattern.base': 'Use letters, numbers, spaces or underscores for the plant name.'
    }),
    genetic: Joi.string()
    .min(3)
    .required()
    .messages({
        'string.min': 'Choose a genetic family.',
        'string.empty': 'Choose a genetic family.',
        'any.required': 'Choose a genetic family.',
        'string.base': 'Choose a genetic family.',
    }),
    growMode: Joi.string()
    .required()
    .messages({
        'string.empty': 'Choose a grow mode.',
        'any.required': 'Choose a grow mode.',
        'string.base': 'Choose a grow mode.'
    }),
    date: Joi.date()
    .required()
    .messages({
        'date.base': 'Choose a valid germination date.',
        'any.required': 'Choose a germination date.',
    }),
    auto: Joi.boolean()
    .required()
    .messages({
        'boolean.base': 'Choose whether this plant is autoflower.',
        'any.required': 'Choose whether this plant is autoflower.',
    })
})
