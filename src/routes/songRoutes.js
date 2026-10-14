import { Router } from 'express';
import * as songController from '../controllers/songController.js';
import { albumIdValidator } from '../validators/albumValidators.js';
import {
  createSongValidator,
  searchSongsValidator,
  songIdValidator,
  updateSongValidator
} from '../validators/songValidators.js';

const songRouter = Router();

songRouter.get('/albums/:albumId/songs', albumIdValidator, songController.getAlbumSongs);
songRouter.post('/albums/:albumId/songs', createSongValidator, songController.createSong);
songRouter.get('/songs', searchSongsValidator, songController.getSongs);
songRouter.get('/songs/:songId', songIdValidator, songController.getSong);
songRouter.put('/songs/:songId', updateSongValidator, songController.updateSong);

export default songRouter;
