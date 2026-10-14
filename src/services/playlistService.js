import HttpError from '../errors/HttpError.js';
import { ensureFound } from '../utils/ensureFound.js';
import * as playlistRepository from '../repositories/playlistRepository.js';
import * as playlistSongRepository from '../repositories/playlistSongRepository.js';
import { getActiveUserById, getUserById } from './userService.js';
import { getAvailableSongById } from './songService.js';

async function getPlaylistById(playlistId) {
  return ensureFound(await playlistRepository.findPlaylistById(playlistId), 'La playlist no existe');
}

export async function listUserPlaylists(userId) {
  await getUserById(userId);
  return playlistRepository.findPlaylistsByUser(userId);
}

export async function getPlaylistWithSongs(playlistId) {
  const playlist = await getPlaylistById(playlistId);
  const songs = await playlistSongRepository.findSongsByPlaylist(playlistId);
  return { ...playlist, songs };
}

export async function createPlaylist(userId, playlistData) {
  await getActiveUserById(userId);
  const playlistId = await playlistRepository.insertPlaylist({ ...playlistData, userId });
  return getPlaylistWithSongs(playlistId);
}

export async function updatePlaylist(playlistId, playlistData) {
  await getPlaylistById(playlistId);
  await playlistRepository.updatePlaylist(playlistId, playlistData);
  return getPlaylistWithSongs(playlistId);
}

export async function deletePlaylist(playlistId) {
  await getPlaylistById(playlistId);
  await playlistRepository.deletePlaylist(playlistId);
}

export async function addSongToPlaylist(playlistId, songId) {
  await getPlaylistById(playlistId);
  await getAvailableSongById(songId);
  const position = await playlistSongRepository.findNextPosition(playlistId);
  await playlistSongRepository.insertPlaylistSong(playlistId, songId, position);
  return getPlaylistWithSongs(playlistId);
}

export async function removeSongFromPlaylist(playlistId, songId) {
  await getPlaylistById(playlistId);
  const removedRows = await playlistSongRepository.deletePlaylistSong(playlistId, songId);

  if (!removedRows) {
    throw new HttpError(404, 'La canción no está en la playlist');
  }

  return getPlaylistWithSongs(playlistId);
}
