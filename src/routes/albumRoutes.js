import { Router } from 'express';
import * as albumController from '../controllers/albumController.js';
import { albumIdValidator, createAlbumValidator, updateAlbumValidator } from '../validators/albumValidators.js';
import { artistIdValidator } from '../validators/artistValidators.js';

const albumRouter = Router();

albumRouter.get('/artists/:artistId/albums', artistIdValidator, albumController.getArtistAlbums);
albumRouter.post('/artists/:artistId/albums', createAlbumValidator, albumController.createAlbum);
albumRouter.get('/albums/:albumId', albumIdValidator, albumController.getAlbum);
albumRouter.put('/albums/:albumId', updateAlbumValidator, albumController.updateAlbum);

export default albumRouter;
