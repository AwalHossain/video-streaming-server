import Joi from "joi";

const schema = Joi.object().keys({
  _id: Joi.string().optional(),
  title: Joi.string().min(3).max(30).required(),
  fileName: Joi.string().min(3).max(30).required(),
  visibility: Joi.string().min(3).max(30).required(),
  recordingDate: Joi.date().required(),
  videoLink: Joi.string().min(3).max(30).required(),
});

const validate = (data: object) => {
  const validationResult = schema.validate(data);
  console.log(`Validation Result`, validationResult);

  return validationResult;
};

export default validate;
