import { body, query } from 'express-validator';
import validateRequest from '../middlewares/validateRequest.js';
import { idBody, idParam, paginationRules } from './commonValidators.js';

export const listPlayEventsValidator = [
  idParam('userId'),
  query('from').optional().isISO8601().withMessage('La fecha inicial debe tener formato ISO 8601'),
  query('to').optional().isISO8601().withMessage('La fecha final debe tener formato ISO 8601'),
  ...paginationRules,
  validateRequest
];

export const createPlayEventValidator = [
  idParam('userId'),
  idBody('songId'),
  body('listenedSeconds').isInt({ min: 1 }).withMessage('El tiempo escuchado debe ser un número entero positivo de segundos').toInt(),
  validateRequest
];
