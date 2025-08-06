import * as Joi from 'joi';

export const configSchema = Joi.object({
  OPEN_AI_API_KEY: Joi.string(),
  OPEN_AI_MODEL: Joi.string().required(),
  OPEN_AI_TEMPERATURE: Joi.string().required(),
  OPEN_AI_MAX_TOKENS: Joi.string().required(),
});
