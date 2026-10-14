import { ensureFound } from '../utils/ensureFound.js';
import * as albumRepository from '../repositories/albumRepository.js';
import { getArtistById } from './artistService.js';

export async function listArtistAlbums(artistId) {
  await getArtistById(artistId);
  return albumRepository.findAlbumsByArtist(artistId);
}

export async function getAlbumById(albumId) {
  return ensureFound(await albumRepository.findAlbumById(albumId), 'El álbum no existe');
}

export async function createAlbum(artistId, albumData) {
  await getArtistById(artistId);
  const albumId = await albumRepository.insertAlbum({ ...albumData, artistId });
  return albumRepository.findAlbumById(albumId);
}

export async function updateAlbum(albumId, albumData) {
  await getAlbumById(albumId);
  await albumRepository.updateAlbum(albumId, albumData);
  return albumRepository.findAlbumById(albumId);
}
