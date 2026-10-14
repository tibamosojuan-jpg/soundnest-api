import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest.js';
import { emailRule } from './userValidators.js';

export const createSessionValidator = [
  emailRule(),
  body('password').isString().notEmpty().withMessage('La contraseña es obligatoria'),
  validateRequest
];
