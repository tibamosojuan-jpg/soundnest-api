import validateRequest from '../middlewares/validateRequest.js';
import { requiredText } from './commonValidators.js';

export const createGenreValidator = [requiredText('name', 50), validateRequest];
