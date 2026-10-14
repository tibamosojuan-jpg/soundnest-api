import * as songService from '../services/songService.js';

export async function getAlbumSongs(req, res) {
  const songs = await songService.listAlbumSongs(req.params.albumId);
  res.status(200).json({ message: 'Canciones del álbum consultadas correctamente', data: songs });
}

export async function getSongs(req, res) {
  const songsPage = await songService.searchSongs(req.query);
  res.status(200).json({ message: 'Canciones consultadas correctamente', data: songsPage });
}

export async function getSong(req, res) {
  const song = await songService.getSongById(req.params.songId);
  res.status(200).json({ message: 'Canción consultada correctamente', data: song });
}

export async function createSong(req, res) {
  const song = await songService.createSong(req.params.albumId, req.body);
  res.status(201).json({ message: 'Canción creada correctamente', data: song });
}

export async function updateSong(req, res) {
  const song = await songService.updateSong(req.params.songId, req.body);
  res.status(200).json({ message: 'Canción actualizada correctamente', data: song });
}
