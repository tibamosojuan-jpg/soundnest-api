import * as playlistService from '../services/playlistService.js';

export async function getUserPlaylists(req, res) {
  const playlists = await playlistService.listUserPlaylists(req.params.userId);
  res.status(200).json({ message: 'Playlists del usuario consultadas correctamente', data: playlists });
}

export async function getPlaylist(req, res) {
  const playlist = await playlistService.getPlaylistWithSongs(req.params.playlistId);
  res.status(200).json({ message: 'Playlist consultada correctamente', data: playlist });
}

export async function createPlaylist(req, res) {
  const playlist = await playlistService.createPlaylist(req.params.userId, req.body);
  res.status(201).json({ message: 'Playlist creada correctamente', data: playlist });
}

export async function updatePlaylist(req, res) {
  const playlist = await playlistService.updatePlaylist(req.params.playlistId, req.body);
  res.status(200).json({ message: 'Playlist actualizada correctamente', data: playlist });
}

export async function deletePlaylist(req, res) {
  await playlistService.deletePlaylist(req.params.playlistId);
  res.status(200).json({ message: 'Playlist eliminada correctamente' });
}

export async function addPlaylistSong(req, res) {
  const playlist = await playlistService.addSongToPlaylist(req.params.playlistId, req.body.songId);
  res.status(201).json({ message: 'Canción agregada a la playlist', data: playlist });
}

export async function removePlaylistSong(req, res) {
  const { playlistId, songId } = req.params;
  const playlist = await playlistService.removeSongFromPlaylist(playlistId, songId);
  res.status(200).json({ message: 'Canción quitada de la playlist', data: playlist });
}
