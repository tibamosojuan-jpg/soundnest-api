import { body, query } from 'express-validator';
import validateRequest from '../middlewares/validateRequest.js';
import { idBody, idParam, paginationRules } from './commonValidators.js';

const reviewStatuses = ['visible', 'hidden'];

export const createReviewValidator = [
  idParam('songId'),
  idBody('userId'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La calificación es obligatoria y debe ser un entero entre 1 y 5').toInt(),
  body('comment')
    .optional({ values: 'null' })
    .isString().withMessage('El comentario debe ser un texto')
    .trim()
    .isLength({ max: 1000 }).withMessage('El comentario admite máximo 1000 caracteres'),
  body('listenCount').optional({ values: 'null' }).isInt({ min: 0 }).withMessage('El número de escuchas debe ser un entero mayor o igual a 0').toInt(),
  body('tags').optional().isArray({ max: 10 }).withMessage('Las etiquetas deben enviarse como una lista de máximo 10 elementos'),
  body('tags.*')
    .isString().withMessage('Cada etiqueta debe ser un texto')
    .trim()
    .toLowerCase()
    .isLength({ min: 1, max: 50 }).withMessage('Cada etiqueta debe tener entre 1 y 50 caracteres')
    .not().contains(',').withMessage('Las etiquetas no pueden contener comas'),
  validateRequest
];

export const listReviewsValidator = [
  query('status').optional().isIn(reviewStatuses).withMessage('El estado debe ser visible o hidden'),
  ...paginationRules,
  validateRequest
];

export const updateReviewValidator = [
  idParam('reviewId'),
  body('status').isIn(reviewStatuses).withMessage('El estado debe ser visible o hidden'),
  validateRequest
];
