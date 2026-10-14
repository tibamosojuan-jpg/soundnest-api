import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest.js';
import { idBody, idParam, optionalUrl, requiredText } from './commonValidators.js';

const playlistBodyRules = [
  requiredText('name', 100),
  body('isPublic').isBoolean({ strict: true }).withMessage('isPublic debe ser true o false').toBoolean(),
  optionalUrl('coverUrl')
];

export const playlistIdValidator = [idParam('playlistId'), validateRequest];

export const createPlaylistValidator = [idParam('userId'), ...playlistBodyRules, validateRequest];

export const updatePlaylistValidator = [idParam('playlistId'), ...playlistBodyRules, validateRequest];

export const addPlaylistSongValidator = [idParam('playlistId'), idBody('songId'), validateRequest];

export const removePlaylistSongValidator = [idParam('playlistId'), idParam('songId'), validateRequest];
