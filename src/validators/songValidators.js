import { body, query } from 'express-validator';
import validateRequest from '../middlewares/validateRequest.js';
import { catalogStatus, idBody, idParam, optionalUrl, paginationRules, requiredText } from './commonValidators.js';

const songBodyRules = [
  requiredText('title', 150),
  idBody('genreId'),
  body('durationSeconds').isInt({ min: 1 }).withMessage('La duración debe ser un número entero positivo de segundos').toInt(),
  body('trackNumber').isInt({ min: 1, max: 999 }).withMessage('El número de pista debe estar entre 1 y 999').toInt(),
  optionalUrl('audioUrl')
];

export const searchSongsValidator = [
  query('title').optional().trim().isLength({ max: 150 }).withMessage('El título admite máximo 150 caracteres'),
  query('genreId').optional().isInt({ min: 1 }).withMessage('El género debe ser un identificador entero positivo'),
  ...paginationRules,
  validateRequest
];

export const songIdValidator = [idParam('songId'), validateRequest];

export const createSongValidator = [idParam('albumId'), ...songBodyRules, validateRequest];

export const updateSongValidator = [idParam('songId'), ...songBodyRules, catalogStatus(), validateRequest];
