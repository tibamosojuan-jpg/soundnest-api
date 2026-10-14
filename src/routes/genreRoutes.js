import { Router } from 'express';
import * as genreController from '../controllers/genreController.js';
import { createGenreValidator } from '../validators/genreValidators.js';

const genreRouter = Router();

genreRouter.get('/genres', genreController.getGenres);
genreRouter.post('/genres', createGenreValidator, genreController.createGenre);

export default genreRouter;
