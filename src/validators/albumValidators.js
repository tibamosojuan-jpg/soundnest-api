import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest.js';
import { idParam, optionalUrl, requiredText } from './commonValidators.js';

const albumBodyRules = [
  requiredText('title', 150),
  body('releaseDate')
    .optional({ values: 'null' })
    .isISO8601({ strict: true }).withMessage('La fecha de lanzamiento debe tener el formato AAAA-MM-DD'),
  optionalUrl('coverUrl')
];

export const albumIdValidator = [idParam('albumId'), validateRequest];

export const createAlbumValidator = [idParam('artistId'), ...albumBodyRules, validateRequest];

export const updateAlbumValidator = [idParam('albumId'), ...albumBodyRules, validateRequest];
