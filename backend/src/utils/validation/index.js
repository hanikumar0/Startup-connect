import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("startup", "investor", "admin").optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const startupOnboardingSchema = Joi.object({
  startupName: Joi.string().required(),
  industry: Joi.string().required(),
  stage: Joi.string().required(),
  fundingRequired: Joi.string().required(),
  location: Joi.string().required(),
  shortDescription: Joi.string().required(),
});

export const investorOnboardingSchema = Joi.object({
  investorName: Joi.string().required(),
  firmName: Joi.string().allow(""),
  investorType: Joi.string().required(),
  checkSize: Joi.string().required(),
  preferredIndustries: Joi.array().items(Joi.string()).required(),
  location: Joi.string().required(),
  bio: Joi.string().required(),
});
