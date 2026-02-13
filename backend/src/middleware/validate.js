import { AppError } from "../utils/AppError.js";

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw new AppError(error.details.map((d) => d.message).join(", "), 400);
  req.body = value;
  next();
};
