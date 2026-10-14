import { Router } from 'express';
import * as playlistController from '../controllers/playlistController.js';
import { userIdValidator } from '../validators/userValidators.js';
import {
  addPlaylistSongValidator,
  createPlaylistValidator,
  playlistIdValidator,
  removePlaylistSongValidator,
  updatePlaylistValidator
} from '../validators/playlistValidators.js';

const playlistRouter = Router();

playlistRouter.get('/users/:userId/playlists', userIdValidator, playlistController.getUserPlaylists);
playlistRouter.post('/users/:userId/playlists', createPlaylistValidator, playlistController.createPlaylist);
playlistRouter.get('/playlists/:playlistId', playlistIdValidator, playlistController.getPlaylist);
playlistRouter.put('/playlists/:playlistId', updatePlaylistValidator, playlistController.updatePlaylist);
playlistRouter.delete('/playlists/:playlistId', playlistIdValidator, playlistController.deletePlaylist);
playlistRouter.post('/playlists/:playlistId/songs', addPlaylistSongValidator, playlistController.addPlaylistSong);
playlistRouter.delete('/playlists/:playlistId/songs/:songId', removePlaylistSongValidator, playlistController.removePlaylistSong);

export default playlistRouter;
