import { body, query } from 'express-validator';
import validateRequest from '../middlewares/validateRequest.js';
import { idParam, paginationRules, requireAnyField, requiredText } from './commonValidators.js';

const userStatuses = ['active', 'suspended'];

export function emailRule() {
  return body('email')
    .isString().withMessage('Debe ser un texto')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('El correo no tiene un formato válido')
    .isLength({ max: 150 }).withMessage('Admite máximo 150 caracteres');
}

function passwordRule() {
  return body('password')
    .isString().withMessage('Debe ser un texto')
    .isLength({ min: 8, max: 255 }).withMessage('La contraseña debe tener entre 8 y 255 caracteres');
}

export const createUserValidator = [
  requiredText('name', 100),
  emailRule(),
  passwordRule(),
  validateRequest
];

export const listUsersValidator = [
  query('search').optional().trim().isLength({ max: 100 }).withMessage('La búsqueda admite máximo 100 caracteres'),
  query('status').optional().isIn(userStatuses).withMessage('El estado debe ser active o suspended'),
  ...paginationRules,
  validateRequest
];

export const userIdValidator = [idParam('userId'), validateRequest];

export const updateUserValidator = [
  idParam('userId'),
  requiredText('name', 100).optional(),
  emailRule().optional(),
  passwordRule().optional(),
  body('status').optional().isIn(userStatuses).withMessage('El estado debe ser active o suspended'),
  requireAnyField(['name', 'email', 'password', 'status']),
  validateRequest
];
