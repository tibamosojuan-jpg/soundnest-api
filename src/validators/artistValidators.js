import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest.js';
import { catalogStatus, idParam, optionalUrl, paginationRules, requiredText } from './commonValidators.js';

const artistBodyRules = [
  requiredText('name', 150),
  body('bio').optional({ values: 'null' }).isString().withMessage('La biografía debe ser un texto').trim(),
  optionalUrl('imageUrl')
];

export const listArtistsValidator = [...paginationRules, validateRequest];

export const artistIdValidator = [idParam('artistId'), validateRequest];

export const createArtistValidator = [...artistBodyRules, validateRequest];

export const updateArtistValidator = [idParam('artistId'), ...artistBodyRules, catalogStatus(), validateRequest];
