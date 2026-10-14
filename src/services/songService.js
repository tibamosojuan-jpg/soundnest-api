import HttpError from '../errors/HttpError.js';
import { ensureFound } from '../utils/ensureFound.js';
import * as songRepository from '../repositories/songRepository.js';
import { fetchPage } from '../utils/pagination.js';
import { getAlbumById } from './albumService.js';
import { getGenreById } from './genreService.js';

export async function listAlbumSongs(albumId) {
  await getAlbumById(albumId);
  return songRepository.findActiveSongsByAlbum(albumId);
}

export function searchSongs({ title, genreId, page, limit }) {
  return fetchPage((range) => songRepository.searchActiveSongs({ title, genreId, ...range }), { page, limit });
}

export async function getSongById(songId) {
  return ensureFound(await songRepository.findSongById(songId), 'La canción no existe');
}

export async function getAvailableSongById(songId) {
  const song = await getSongById(songId);

  if (song.status !== 'active') {
    throw new HttpError(409, 'La canción no está disponible');
  }

  return song;
}

export async function createSong(albumId, songData) {
  await getAlbumById(albumId);
  await getGenreById(songData.genreId);
  const songId = await songRepository.insertSong({ ...songData, albumId });
  return songRepository.findSongById(songId);
}

export async function updateSong(songId, songData) {
  await getSongById(songId);
  await getGenreById(songData.genreId);
  await songRepository.updateSong(songId, songData);
  return songRepository.findSongById(songId);
}
