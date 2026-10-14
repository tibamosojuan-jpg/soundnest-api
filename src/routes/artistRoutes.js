import { Router } from 'express';
import * as artistController from '../controllers/artistController.js';
import {
  artistIdValidator,
  createArtistValidator,
  listArtistsValidator,
  updateArtistValidator
} from '../validators/artistValidators.js';

const artistRouter = Router();

artistRouter.get('/artists', listArtistsValidator, artistController.getArtists);
artistRouter.post('/artists', createArtistValidator, artistController.createArtist);
artistRouter.get('/artists/:artistId', artistIdValidator, artistController.getArtist);
artistRouter.put('/artists/:artistId', updateArtistValidator, artistController.updateArtist);

export default artistRouter;
