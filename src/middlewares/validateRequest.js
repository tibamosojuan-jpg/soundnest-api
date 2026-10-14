import { validationResult } from 'express-validator';

export default function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    message: 'Los datos enviados no son válidos',
    errors: result.array().map(({ path, msg }) => ({ field: path, message: msg }))
  });
}
