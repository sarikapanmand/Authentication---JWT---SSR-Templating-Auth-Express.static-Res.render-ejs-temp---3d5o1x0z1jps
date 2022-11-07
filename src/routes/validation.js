// Validation
const Joi = require("joi");

// Register validation
const registerValidation = (data) => {
  // Your code goes here
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};
// Login validation
const loginValidation = (data) => {
  // Your code goes here
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
